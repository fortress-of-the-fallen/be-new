import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { ConfigCatalogService } from 'src/shared/services/config-catalog.service';
import { IdempotencyService } from 'src/shared/services/idempotency.service';
import { QuestService } from 'src/shared/services/quest.service';
import { RewardService } from 'src/shared/services/reward.service';
import { TutorialProgressService } from 'src/shared/services/tutorial-progress.service';

type InventoryHeroView = {
   instanceId: string;
   itemId: string;
   itemType: string;
   itemClass?: string | null;
   remainingUses: number;
   customData: Record<string, string>;
};

@Injectable()
export class UpgradeHeroApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly configCatalogService: ConfigCatalogService,
      private readonly idempotencyService: IdempotencyService,
      private readonly rewardService: RewardService,
      private readonly questService: QuestService,
      private readonly tutorialProgressService: TutorialProgressService,
   ) {}

   async upgrade(playerId: string, instanceId: string, configVersion: string, idempotencyKey: string) {
      await this.configCatalogService.assertConfigVersion(configVersion);

      return this.idempotencyService.execute({
         playerId,
         idempotencyKey,
         action: 'inventory.hero.upgrade',
         requestBody: {
            instanceId,
            configVersion,
         },
         handler: async () =>
            this.prisma.$transaction(async db => {
               const hero = await db.playerInventoryItem.findFirst({
                  where: {
                     id: instanceId,
                     playerId,
                     itemType: 'hero',
                  },
               });

               if (!hero) {
                  throw new ApiErrorException(
                     HttpStatus.NOT_FOUND,
                     ApiErrorCode.HeroInstanceNotFound,
                     'Hero instance not found',
                  );
               }

               const customData = ((hero.customData as Record<string, string>) ?? {}) as Record<
                  string,
                  string
               >;
               const currentLevel = Number(customData.lv ?? '1');
               const heroConfig = await this.configCatalogService.getHeroConfig(hero.itemId);
               const rule = await this.configCatalogService.getHeroUpgradeRule(hero.itemId, currentLevel);

               const shardCurrency = this.mapShardCurrency(heroConfig.shardCurrency);

               try {
                  await this.rewardService.assertResources({
                     db,
                     playerId,
                     requiredCurrency: {
                        gold: rule.goldCost,
                        [this.mapRewardCurrencyField(shardCurrency)]: rule.shardCost,
                     },
                  });
               } catch (error) {
                  if (this.isInsufficientResourceError(error)) {
                     throw new ApiErrorException(
                        HttpStatus.CONFLICT,
                        ApiErrorCode.InsufficientResources,
                        'Not enough resources to upgrade hero',
                     );
                  }

                  throw error;
               }

               const rewardResult = await this.rewardService.applyRewards({
                  db,
                  playerId,
                  sourceType: 'upgrade',
                  sourceId: instanceId,
                  idempotencyKey,
                  rewards: [
                     { itemId: 'GO', quantity: rule.goldCost * -1, customData: null },
                     {
                        itemId: shardCurrency,
                        quantity: rule.shardCost * -1,
                        customData: null,
                     },
                  ].filter(reward => reward.quantity !== 0),
               });

               const updatedHero = await db.playerInventoryItem.update({
                  where: {
                     id: hero.id,
                  },
                  data: {
                     customData: {
                        ...customData,
                        lv: String(currentLevel + 1),
                     },
                  },
               });
               const updatedHeroView = this.mapHero(updatedHero);
               const consumed = [
                  { itemId: 'GO', quantity: rule.goldCost },
                  {
                     itemId: shardCurrency,
                     quantity: rule.shardCost,
                  },
               ].filter(item => item.quantity > 0);

               const player = await db.player.findUnique({
                  where: {
                     id: playerId,
                  },
                  select: {
                     statistics: true,
                     tutorialProgress: true,
                     updatedAt: true,
                  },
               });

               if (!player) {
                  throw new ApiErrorException(
                     HttpStatus.NOT_FOUND,
                     ApiErrorCode.NotFound,
                     `Player ${playerId} was not found`,
                  );
               }

               const tutorialProgressUpdate = this.tutorialProgressService.applyUpgradeTutorialCompletion(
                  player.tutorialProgress,
                  player.statistics,
                  player.updatedAt,
               );

               if (tutorialProgressUpdate.changed) {
                  await db.player.update({
                     where: {
                        id: playerId,
                     },
                     data: {
                        tutorialProgress: tutorialProgressUpdate.storedTutorialProgress,
                     },
                  });
               }

               const questUpdates = await this.questService.applyProgress(
                  playerId,
                  [{ actionId: 'UPGRADE_UNIT', amount: 1 }],
                  db,
               );

               return {
                  updatedHero: updatedHeroView,
                  hero: updatedHeroView,
                  consumed,
                  currency: rewardResult.currency,
                  tutorialProgress: this.tutorialProgressService.normalize(
                     tutorialProgressUpdate.storedTutorialProgress,
                     player.statistics,
                     player.updatedAt,
                     [{ customData: updatedHero.customData }],
                  ),
                  questUpdates,
               };
            }),
      });
   }

   private mapShardCurrency(
      currency: 'normalShard' | 'eliteShard' | 'specialShard',
   ): 'NormalShard' | 'EliteShard' | 'SpecialShard' {
      switch (currency) {
         case 'eliteShard':
            return 'EliteShard';
         case 'specialShard':
            return 'SpecialShard';
         default:
            return 'NormalShard';
      }
   }

   private mapRewardCurrencyField(
      rewardCurrency: 'NormalShard' | 'EliteShard' | 'SpecialShard',
   ): 'normalShard' | 'eliteShard' | 'specialShard' {
      switch (rewardCurrency) {
         case 'EliteShard':
            return 'eliteShard';
         case 'SpecialShard':
            return 'specialShard';
         default:
            return 'normalShard';
      }
   }

   private isInsufficientResourceError(error: unknown): boolean {
      if (!(error instanceof ApiErrorException)) {
         return false;
      }

      const response = error.getResponse() as { code?: string };
      return response?.code === ApiErrorCode.InsufficientResource;
   }

   private mapHero(hero: {
      id: string;
      itemId: string;
      itemType: string;
      itemClass?: string | null;
      remainingUses: number;
      customData: unknown;
   }): InventoryHeroView {
      return {
         instanceId: hero.id,
         itemId: hero.itemId,
         itemType: hero.itemType,
         itemClass: hero.itemClass ?? null,
         remainingUses: hero.remainingUses,
         customData: ((hero.customData as Record<string, string>) ?? {}) as Record<string, string>,
      };
   }
}

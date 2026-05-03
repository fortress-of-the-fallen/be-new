import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { ConfigCatalogService } from 'src/shared/services/config-catalog.service';
import { IdempotencyService } from 'src/shared/services/idempotency.service';
import { QuestService } from 'src/shared/services/quest.service';
import { RewardService } from 'src/shared/services/reward.service';

@Injectable()
export class UpgradeHeroApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly configCatalogService: ConfigCatalogService,
      private readonly idempotencyService: IdempotencyService,
      private readonly rewardService: RewardService,
      private readonly questService: QuestService,
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
                     ApiErrorCode.NotFound,
                     `Hero instance ${instanceId} was not found`,
                  );
               }

               const customData = ((hero.customData as Record<string, string>) ?? {}) as Record<
                  string,
                  string
               >;
               const currentLevel = Number(customData.lv ?? '1');
               const heroConfig = await this.configCatalogService.getHeroConfig(hero.itemId);
               const rule = await this.configCatalogService.getHeroUpgradeRule(hero.itemId, currentLevel);

               const rewardResult = await this.rewardService.applyRewards({
                  db,
                  playerId,
                  sourceType: 'upgrade',
                  sourceId: instanceId,
                  idempotencyKey,
                  rewards: [
                     { itemId: 'GO', quantity: rule.goldCost * -1, customData: null },
                     {
                        itemId: this.mapShardCurrency(heroConfig.shardCurrency),
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

               const questUpdates = await this.questService.applyProgress(
                  playerId,
                  [{ actionId: 'UPGRADE_UNIT', amount: 1 }],
                  db,
               );

               return {
                  hero: {
                     instanceId: updatedHero.id,
                     itemId: updatedHero.itemId,
                     itemType: updatedHero.itemType,
                     customData: updatedHero.customData,
                  },
                  currency: rewardResult.currency,
                  questUpdates,
               };
            }),
      });
   }

   private mapShardCurrency(currency: 'normalShard' | 'eliteShard' | 'specialShard'): string {
      switch (currency) {
         case 'eliteShard':
            return 'EliteShard';
         case 'specialShard':
            return 'SpecialShard';
         default:
            return 'NormalShard';
      }
   }
}

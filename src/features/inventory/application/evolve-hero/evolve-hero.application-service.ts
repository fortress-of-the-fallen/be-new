import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { ConfigCatalogService } from 'src/shared/services/config-catalog.service';
import { IdempotencyService } from 'src/shared/services/idempotency.service';
import { RewardService } from 'src/shared/services/reward.service';

type InventoryHeroView = {
   instanceId: string;
   itemId: string;
   itemType: string;
   itemClass?: string | null;
   remainingUses: number;
   customData: Record<string, string>;
};

@Injectable()
export class EvolveHeroApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly configCatalogService: ConfigCatalogService,
      private readonly idempotencyService: IdempotencyService,
      private readonly rewardService: RewardService,
   ) {}

   async evolve(playerId: string, instanceId: string, configVersion: string, idempotencyKey: string) {
      await this.configCatalogService.assertConfigVersion(configVersion);

      return this.idempotencyService.execute({
         playerId,
         idempotencyKey,
         action: 'inventory.hero.evolve',
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
               const currentEvolveLevel = Number(customData.evlove_lv ?? '1');
               const heroConfig = await this.configCatalogService.getHeroConfig(hero.itemId);
               const rule = await this.configCatalogService.getHeroEvolveRule(
                  hero.itemId,
                  currentEvolveLevel,
               );

               const duplicates = await db.playerInventoryItem.findMany({
                  where: {
                     playerId,
                     itemType: 'hero',
                     itemId: hero.itemId,
                     id: {
                        not: instanceId,
                     },
                  },
                  orderBy: {
                     createdAt: 'asc',
                  },
               });

               if (duplicates.length < rule.copiesRequired) {
                  throw new ApiErrorException(
                     HttpStatus.CONFLICT,
                     ApiErrorCode.InsufficientResource,
                     `Not enough duplicate copies to evolve ${hero.itemId}`,
                     {
                        requiredCopies: rule.copiesRequired,
                        availableCopies: duplicates.length,
                     },
                  );
               }

               const rewardResult = await this.rewardService.applyRewards({
                  db,
                  playerId,
                  sourceType: 'evolve',
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

               await db.playerInventoryItem.deleteMany({
                  where: {
                     id: {
                        in: duplicates.slice(0, rule.copiesRequired).map(item => item.id),
                     },
                  },
               });

               const updatedHero = await db.playerInventoryItem.update({
                  where: {
                     id: hero.id,
                  },
                  data: {
                     customData: {
                        ...customData,
                        evlove_lv: String(currentEvolveLevel + 1),
                     },
                  },
               });
               const updatedHeroView = this.mapHero(updatedHero);

               return {
                  updatedHero: updatedHeroView,
                  hero: updatedHeroView,
                  consumed: [
                     {
                        itemId: hero.itemId,
                        quantity: rule.copiesRequired,
                     },
                  ],
                  currency: rewardResult.currency,
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

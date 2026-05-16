import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ConfigCatalogService } from 'src/shared/services/config-catalog.service';
import { IdempotencyService } from 'src/shared/services/idempotency.service';
import { RewardService } from 'src/shared/services/reward.service';
import { IdentityHelper } from 'src/shared/helper/identity.helper';

@Injectable()
export class PurchaseSkillApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly configCatalogService: ConfigCatalogService,
      private readonly idempotencyService: IdempotencyService,
      private readonly rewardService: RewardService,
   ) {}

   async purchase(playerId: string, itemId: string, configVersion: string, idempotencyKey: string) {
      await this.configCatalogService.assertConfigVersion(configVersion);

      return this.idempotencyService.execute({
         playerId,
         idempotencyKey,
         action: 'inventory.skill.purchase',
         requestBody: {
            itemId,
            configVersion,
         },
         handler: async () =>
            this.prisma.$transaction(async db => {
               const rule = await this.configCatalogService.getSkillPurchaseRule(itemId);
               const rewardResult = await this.rewardService.applyRewards({
                  db,
                  playerId,
                  sourceType: 'skill_purchase',
                  sourceId: itemId,
                  idempotencyKey,
                  rewards: [
                     {
                        itemId: this.mapCurrencyToItemId(rule.currency),
                        quantity: rule.cost * -1,
                        customData: null,
                     },
                  ],
               });

               const skill = await db.playerInventoryItem.create({
                  data: {
                     id: `si_${itemId.toLowerCase()}_${IdentityHelper.generateNanoID(8)}`,
                     playerId,
                     itemId,
                     itemType: 'skill',
                     remainingUses: 0,
                     customData: {
                        lv: '1',
                        lv_skill: '1',
                     },
                  },
               });

               return {
                  skill: {
                     instanceId: skill.id,
                     itemId: skill.itemId,
                     itemType: skill.itemType,
                     customData: skill.customData,
                  },
                  currency: rewardResult.currency,
               };
            }),
      });
   }

   private mapCurrencyToItemId(currency: string): string {
      switch (currency) {
         case 'gold':
            return 'GO';
         case 'gem':
            return 'GE';
         case 'normalShard':
            return 'NormalShard';
         case 'eliteShard':
            return 'EliteShard';
         case 'specialShard':
            return 'SpecialShard';
         default:
            return 'GO';
      }
   }
}

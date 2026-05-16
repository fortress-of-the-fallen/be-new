import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { ConfigCatalogService } from 'src/shared/services/config-catalog.service';
import { IdempotencyService } from 'src/shared/services/idempotency.service';
import { RewardService } from 'src/shared/services/reward.service';

@Injectable()
export class UpgradeSkillApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly configCatalogService: ConfigCatalogService,
      private readonly idempotencyService: IdempotencyService,
      private readonly rewardService: RewardService,
   ) {}

   async upgrade(playerId: string, instanceId: string, configVersion: string, idempotencyKey: string) {
      await this.configCatalogService.assertConfigVersion(configVersion);

      return this.idempotencyService.execute({
         playerId,
         idempotencyKey,
         action: 'inventory.skill.upgrade',
         requestBody: {
            instanceId,
            configVersion,
         },
         handler: async () =>
            this.prisma.$transaction(async db => {
               const skill = await db.playerInventoryItem.findFirst({
                  where: {
                     id: instanceId,
                     playerId,
                     itemType: 'skill',
                  },
               });

               if (!skill) {
                  throw new ApiErrorException(
                     HttpStatus.NOT_FOUND,
                     ApiErrorCode.NotFound,
                     `Skill instance ${instanceId} was not found`,
                  );
               }

               const customData = ((skill.customData as Record<string, string>) ?? {}) as Record<
                  string,
                  string
               >;
               const currentLevel = Number(customData.lv ?? customData.lv_skill ?? '1');
               const rule = await this.configCatalogService.getSkillUpgradeRule(
                  skill.itemId,
                  currentLevel,
               );

               const rewardResult = await this.rewardService.applyRewards({
                  db,
                  playerId,
                  sourceType: 'skill_upgrade',
                  sourceId: instanceId,
                  idempotencyKey,
                  rewards: [
                     {
                        itemId: this.mapCurrencyToItemId(rule.currency),
                        quantity: rule.cost * -1,
                        customData: null,
                     },
                  ],
               });

               const updatedSkill = await db.playerInventoryItem.update({
                  where: {
                     id: skill.id,
                  },
                  data: {
                     customData: {
                        ...customData,
                        lv: String(currentLevel + 1),
                        lv_skill: String(currentLevel + 1),
                     },
                  },
               });

               return {
                  skill: {
                     instanceId: updatedSkill.id,
                     itemId: updatedSkill.itemId,
                     itemType: updatedSkill.itemType,
                     customData: updatedSkill.customData,
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
         case 'eliteShard':
            return 'EliteShard';
         case 'specialShard':
            return 'SpecialShard';
         default:
            return 'NormalShard';
      }
   }
}

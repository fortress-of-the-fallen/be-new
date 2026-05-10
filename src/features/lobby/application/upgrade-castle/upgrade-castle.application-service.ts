import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiErrorCode } from 'src/api/api-error-code';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { ConfigCatalogService } from 'src/shared/services/config-catalog.service';
import { IdempotencyService } from 'src/shared/services/idempotency.service';
import { RewardService } from 'src/shared/services/reward.service';

const CASTLE_TIER = 1;
const CASTLE_UPGRADE_CLICK_COST = 125;

@Injectable()
export class UpgradeCastleApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly configCatalogService: ConfigCatalogService,
      private readonly idempotencyService: IdempotencyService,
      private readonly rewardService: RewardService,
   ) {}

   async upgrade(playerId: string, configVersion: string, idempotencyKey: string) {
      await this.configCatalogService.assertConfigVersion(configVersion);

      return this.idempotencyService.execute({
         playerId,
         idempotencyKey,
         action: 'lobby.castle.upgrade',
         requestBody: {
            configVersion,
            tier: CASTLE_TIER,
         },
         handler: async () =>
            this.prisma.$transaction(async db => {
               const [player, rules] = await Promise.all([
                  db.player.findUnique({
                     where: {
                        id: playerId,
                     },
                  }),
                  this.configCatalogService.getLobbyUpgradeRules(CASTLE_TIER),
               ]);

               if (!player) {
                  throw new ApiErrorException(
                     HttpStatus.NOT_FOUND,
                     ApiErrorCode.NotFound,
                     `Player ${playerId} was not found`,
                  );
               }

               const currency = this.normalizeCurrency(player.currency);
               const statistics = this.normalizeStatistics(player.statistics);
               const currentLevel = statistics.levelCastle;
               const currentSpent = statistics.lobbyUpgradeSpent;
               const maxRule = rules.at(-1);

               if (!maxRule || currentLevel >= maxRule.Level || currentSpent >= maxRule.CostTotal) {
                  throw new ApiErrorException(
                     HttpStatus.CONFLICT,
                     ApiErrorCode.MaxCastleLevel,
                     'Castle is already at max level',
                  );
               }

               const remainingToMax = maxRule.CostTotal - currentSpent;
               const spendGold = Math.min(CASTLE_UPGRADE_CLICK_COST, remainingToMax);

               if (spendGold <= 0) {
                  throw new ApiErrorException(
                     HttpStatus.CONFLICT,
                     ApiErrorCode.MaxCastleLevel,
                     'Castle is already at max level',
                  );
               }

               if (currency.gold < spendGold) {
                  throw new ApiErrorException(
                     HttpStatus.CONFLICT,
                     ApiErrorCode.InsufficientGold,
                     'Not enough gold to upgrade castle',
                  );
               }

               const rewardResult = await this.rewardService.applyRewards({
                  db,
                  playerId,
                  sourceType: 'castle_upgrade',
                  sourceId: `tier:${CASTLE_TIER}`,
                  idempotencyKey,
                  rewards: [{ itemId: 'GO', quantity: spendGold * -1, customData: null }],
               });

               const nextSpent = currentSpent + spendGold;
               const nextLevel = this.resolveCastleLevel(rules, nextSpent);
               const nextStatistics = {
                  ...rewardResult.statistics,
                  levelCastle: nextLevel,
                  lobbyUpgradeSpent: nextSpent,
               };

               await db.player.update({
                  where: {
                     id: playerId,
                  },
                  data: {
                     statistics: nextStatistics,
                  },
               });

               return {
                  levelCastle: nextLevel,
                  lobbyUpgradeSpent: nextSpent,
                  spentGold: spendGold,
                  currency: rewardResult.currency,
                  statistics: nextStatistics,
               };
            }),
      });
   }

   private normalizeCurrency(value: unknown): {
      gold: number;
   } {
      const current = (value as Record<string, unknown>) ?? {};
      return {
         gold: Number(current.gold ?? 0),
      };
   }

   private normalizeStatistics(value: unknown): {
      levelCastle: number;
      lobbyUpgradeSpent: number;
   } {
      const current = (value as Record<string, unknown>) ?? {};
      return {
         levelCastle: Number(current.levelCastle ?? 0),
         lobbyUpgradeSpent: Number(current.lobbyUpgradeSpent ?? 0),
      };
   }

   private resolveCastleLevel(
      rules: Array<{
         Level: number;
         CostTotal: number;
      }>,
      spent: number,
   ): number {
      return (
         [...rules]
            .reverse()
            .find(rule => spent >= rule.CostTotal)?.Level ?? 0
      );
   }
}

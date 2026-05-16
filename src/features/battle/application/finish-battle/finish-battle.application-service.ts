import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { IdempotencyService } from 'src/shared/services/idempotency.service';
import { LeaderboardService } from 'src/shared/services/leaderboard.service';
import { QuestService } from 'src/shared/services/quest.service';
import { RewardService } from 'src/shared/services/reward.service';
import { ConfigCatalogService } from 'src/shared/services/config-catalog.service';
import { FinishBattleReq } from 'src/api/model/req/battle/finish-battle-req.model';
import { TutorialProgressService } from 'src/shared/services/tutorial-progress.service';
import { RewardItem } from 'src/shared/services/fotf-config.defaults';

@Injectable()
export class FinishBattleApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly idempotencyService: IdempotencyService,
      private readonly configCatalogService: ConfigCatalogService,
      private readonly rewardService: RewardService,
      private readonly questService: QuestService,
      private readonly leaderboardService: LeaderboardService,
      private readonly tutorialProgressService: TutorialProgressService,
   ) {}

   async finish(playerId: string, battleId: string, req: FinishBattleReq) {
      return this.idempotencyService.execute({
         playerId,
         idempotencyKey: req.idempotencyKey,
         action: 'battle.finish',
         requestBody: {
            battleId,
            result: req.result,
            durationSec: req.durationSec,
            winCondition: req.winCondition,
            playerPercent: req.playerPercent,
         },
         handler: async () =>
            this.prisma.$transaction(async db => {
               const battle = await db.battleSession.findUnique({
                  where: {
                     id: battleId,
                  },
               });

               if (!battle || battle.playerId !== playerId) {
                  throw new ApiErrorException(
                     HttpStatus.NOT_FOUND,
                     ApiErrorCode.NotFound,
                     `Battle ${battleId} was not found`,
                  );
               }

               if (battle.status === 'finished') {
                  throw new ApiErrorException(
                     HttpStatus.CONFLICT,
                     ApiErrorCode.BattleAlreadyFinished,
                     `Battle ${battleId} was already finished`,
                  );
               }

               if (battle.expiresAt <= new Date()) {
                  throw new ApiErrorException(
                     HttpStatus.CONFLICT,
                     ApiErrorCode.BattleExpired,
                     `Battle ${battleId} is no longer claimable`,
                  );
               }

               const playerBeforeBattle = await db.player.findUnique({
                  where: {
                     id: playerId,
                  },
               });

               if (!playerBeforeBattle) {
                  throw new ApiErrorException(
                     HttpStatus.NOT_FOUND,
                     ApiErrorCode.NotFound,
                     `Player ${playerId} was not found`,
                  );
               }

               const battleRewards = await this.resolveBattleRewards(
                  battle.mode,
                  req,
                  playerBeforeBattle,
               );

               const rewardResult = await this.rewardService.applyRewards({
                  db,
                  playerId,
                  sourceType: 'battle',
                  sourceId: battleId,
                  idempotencyKey: req.idempotencyKey,
                  rewards: battleRewards,
               });

               const [player, heroInventory] = await Promise.all([
                  db.player.findUnique({
                     where: {
                        id: playerId,
                     },
                  }),
                  db.playerInventoryItem.findMany({
                     where: {
                        playerId,
                        itemType: 'hero',
                     },
                     select: {
                        customData: true,
                     },
                  }),
               ]);

               if (!player) {
                  throw new ApiErrorException(
                     HttpStatus.NOT_FOUND,
                     ApiErrorCode.NotFound,
                     `Player ${playerId} was not found`,
                  );
               }

               const statistics = this.normalizeStatistics(player.statistics);
               let storedTutorialProgress = player.tutorialProgress;
               let tutorialProgressChanged = false;

               if (req.result === 'WIN') {
                  const tutorialProgressUpdate = this.tutorialProgressService.applyBattleWin(
                     playerBeforeBattle.tutorialProgress,
                     playerBeforeBattle.statistics,
                     playerBeforeBattle.updatedAt,
                  );

                  storedTutorialProgress = tutorialProgressUpdate.storedTutorialProgress;
                  tutorialProgressChanged = tutorialProgressUpdate.changed;
               }

               if (battle.mode === 'PVE' && req.result === 'WIN') {
                  statistics.stageCampaign += 1;
                  statistics.battlesPlayed += 1;
                  statistics.battlesWon += 1;
               }

               const tutorialProgress = this.tutorialProgressService.normalize(
                  storedTutorialProgress,
                  statistics,
                  player.updatedAt,
                  heroInventory,
               );

               if ((battle.mode === 'PVE' && req.result === 'WIN') || tutorialProgressChanged) {
                  await db.player.update({
                     where: {
                        id: playerId,
                     },
                     data: {
                        ...(battle.mode === 'PVE' && req.result === 'WIN' ? { statistics } : {}),
                        ...(tutorialProgressChanged ? { tutorialProgress: storedTutorialProgress } : {}),
                     },
                  });
               }

               const progressActions = [{ actionId: 'PLAY_GAME', amount: 1 }];
               if (req.result === 'WIN') {
                  progressActions.push({ actionId: 'WIN_BATTLE', amount: 1 });
               }

               const questUpdates = await this.questService.applyProgress(playerId, progressActions, db);

               await db.battleSession.update({
                  where: {
                     id: battle.id,
                  },
                  data: {
                     status: 'finished',
                     finishedAt: new Date(),
                     result: req.result,
                     summary: {
                        durationSec: req.durationSec,
                        winCondition: req.winCondition,
                        playerPercent: req.playerPercent,
                     },
                     rewards: rewardResult.rewards,
                  },
               });

               await this.leaderboardService.syncPlayerProjection(playerId, db);

               return {
                  battleId,
                  result: req.result,
                  grantedRewards: rewardResult.rewards,
                  rewards: rewardResult.rewards,
                  playerDelta: rewardResult.playerDelta,
                  statistics,
                  tutorialProgress,
                  currency: rewardResult.currency,
                  questUpdates,
               };
            }),
      });
   }

   private normalizeStatistics(value: unknown) {
      const current = (value as Record<string, unknown>) ?? {};
      const score = Number(current.score ?? 0);
      return {
         ...current,
         level: Number(current.level ?? 1),
         exp: Number(current.exp ?? 0),
         score,
         trophy: Number(current.trophy ?? score),
         stageCampaign: Number(current.stageCampaign ?? 1),
         battlesPlayed: Number(current.battlesPlayed ?? 0),
         battlesWon: Number(current.battlesWon ?? 0),
      };
   }

   private async resolveBattleRewards(
      mode: string,
      req: FinishBattleReq,
      playerBeforeBattle: {
         statistics: unknown;
         tutorialProgress: unknown;
         updatedAt: Date;
      },
   ): Promise<RewardItem[]> {
      const statistics = this.normalizeStatistics(playerBeforeBattle.statistics);
      const tutorialProgress = this.tutorialProgressService.normalize(
         playerBeforeBattle.tutorialProgress,
         statistics,
         playerBeforeBattle.updatedAt,
      );

      if (mode === 'PVE') {
         if (!tutorialProgress.finishOnboarding) {
            return req.result === 'WIN'
               ? [{ itemId: 'GO', quantity: 100, customData: null }]
               : [];
         }

         return this.resolveCampaignRewards(
            statistics.stageCampaign,
            req.result,
            req.playerPercent,
         );
      }

      return this.configCatalogService.getRankBattleRewards(statistics.score, req.result);
   }

   private async resolveCampaignRewards(
      stageCampaignBeforeFinish: number,
      result: FinishBattleReq['result'],
      playerPercent: number,
   ): Promise<RewardItem[]> {
      const stageForReward =
         result === 'WIN'
            ? Math.max(stageCampaignBeforeFinish - 1, 1)
            : Math.max(stageCampaignBeforeFinish, 1);
      const campaignRule = await this.configCatalogService.getCampaignRewardRule(stageForReward);

      const goldReward =
         result === 'WIN'
            ? Math.floor(campaignRule.goldReward * (playerPercent + 0.5))
            : result === 'DRAW'
              ? Math.floor(campaignRule.goldReward * 0.75)
              : Math.floor(campaignRule.goldReward / 2);

      return goldReward > 0 ? [{ itemId: 'GO', quantity: goldReward, customData: null }] : [];
   }
}

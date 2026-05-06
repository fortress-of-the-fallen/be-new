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

               const rewardRule = await this.configCatalogService.getRankRewardRule(
                  battle.mode,
                  req.result,
               );
               const rewardResult = await this.rewardService.applyRewards({
                  db,
                  playerId,
                  sourceType: 'battle',
                  sourceId: battleId,
                  idempotencyKey: req.idempotencyKey,
                  rewards: rewardRule.rewards,
               });

               const player = await db.player.findUnique({
                  where: {
                     id: playerId,
                  },
               });

               if (!player) {
                  throw new ApiErrorException(
                     HttpStatus.NOT_FOUND,
                     ApiErrorCode.NotFound,
                     `Player ${playerId} was not found`,
                  );
               }

               const statistics = this.normalizeStatistics(player.statistics);
               let tutorialProgress = this.tutorialProgressService.normalize(
                  player.tutorialProgress,
                  statistics,
                  player.updatedAt,
               );

               if (battle.mode === 'PVE' && req.result === 'WIN') {
                  statistics.stageCampaign += 1;
                  statistics.battlesPlayed += 1;
                  statistics.battlesWon += 1;

                  const tutorialProgressUpdate = this.tutorialProgressService.applyOnboardingBattleWin(
                     player.tutorialProgress,
                     statistics,
                     player.updatedAt,
                  );
                  tutorialProgress = tutorialProgressUpdate.tutorialProgress;

                  await db.player.update({
                     where: {
                        id: playerId,
                     },
                     data: {
                        statistics,
                        tutorialProgress,
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
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { ConfigCatalogService } from './config-catalog.service';
import { RewardItem } from './fotf-config.defaults';
import { RewardService } from './reward.service';

type PrismaDbClient = any;
type QuestTrack = 'daily' | 'weekly';
type QuestType = 'daily' | 'weekly' | 'achievement';

export type QuestView = {
   questId: number;
   type: QuestType;
   actionId: string;
   description: string;
   progress: number;
   required: number;
   isCompleted: boolean;
   rewardClaimed: boolean;
   rewards: RewardItem[];
};

export type QuestProgressRewardView = {
   stage: number;
   claimed: boolean;
   isUnlocked: boolean;
   reward: RewardItem;
};

export type QuestUpdateView = {
   questId: number;
   type: QuestType;
   actionId: string;
   progress: number;
   required: number;
   isCompleted: boolean;
   rewardClaimed: boolean;
};

export type QuestStateView = {
   daily: {
      resetAt: string;
      points: number;
      quests: QuestView[];
      progressRewards: QuestProgressRewardView[];
   };
   weekly: {
      resetAt: string;
      points: number;
      quests: QuestView[];
      progressRewards: QuestProgressRewardView[];
   };
   achievement: {
      quests: QuestView[];
   };
};

@Injectable()
export class QuestService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly configCatalogService: ConfigCatalogService,
      private readonly rewardService: RewardService,
   ) {}

   async getState(playerId: string, db: PrismaDbClient = this.prisma): Promise<QuestStateView> {
      const period = this.getPeriods(new Date());
      const definitions = await this.configCatalogService.getQuestDefinitions();
      const activeQuestIds = definitions.quests.map(definition => definition.id);
      const activeProgressRewardKeys = new Set(
         definitions.progressRewards.map(definition => `${definition.track}:${definition.stage}`),
      );

      await this.ensureState(db, playerId, period, definitions);

      const [questRows, rewardRows] = await Promise.all([
         db.playerQuest.findMany({
            where: {
               playerId,
               questId: {
                  in: activeQuestIds,
               },
               OR: [
                  { type: 'daily', periodKey: period.daily.key },
                  { type: 'weekly', periodKey: period.weekly.key },
                  { type: 'achievement', periodKey: period.achievementKey },
               ],
            },
            orderBy: [{ type: 'asc' }, { questId: 'asc' }],
         }),
         db.playerQuestProgressReward.findMany({
            where: {
               playerId,
               OR: [
                  { track: 'daily', periodKey: period.daily.key },
                  { track: 'weekly', periodKey: period.weekly.key },
               ],
            },
            orderBy: [{ track: 'asc' }, { stage: 'asc' }],
         }),
      ]);

      const quests = questRows.filter(quest => activeQuestIds.includes(quest.questId));
      const rewards = rewardRows.filter(reward =>
         activeProgressRewardKeys.has(`${reward.track}:${reward.stage}`),
      );

      return {
         daily: {
            resetAt: period.daily.resetAt.toISOString(),
            points: rewards.find(reward => reward.track === 'daily')?.points ?? 0,
            quests: this.mapQuestViews(
               quests.filter(quest => quest.type === 'daily'),
               definitions.quests,
            ),
            progressRewards: this.mapProgressRewardViews(
               rewards.filter(reward => reward.track === 'daily'),
            ),
         },
         weekly: {
            resetAt: period.weekly.resetAt.toISOString(),
            points: rewards.find(reward => reward.track === 'weekly')?.points ?? 0,
            quests: this.mapQuestViews(
               quests.filter(quest => quest.type === 'weekly'),
               definitions.quests,
            ),
            progressRewards: this.mapProgressRewardViews(
               rewards.filter(reward => reward.track === 'weekly'),
            ),
         },
         achievement: {
            quests: this.mapQuestViews(
               quests.filter(quest => quest.type === 'achievement'),
               definitions.quests,
            ),
         },
      };
   }

   async applyProgress(
      playerId: string,
      actions: Array<{ actionId: string; amount: number }>,
      db: PrismaDbClient = this.prisma,
   ): Promise<QuestUpdateView[]> {
      const period = this.getPeriods(new Date());
      const definitions = await this.configCatalogService.getQuestDefinitions();
      const activeQuestIds = definitions.quests.map(definition => definition.id);
      await this.ensureState(db, playerId, period, definitions);

      const totals = actions.reduce<Record<string, number>>((acc, action) => {
         acc[action.actionId] = (acc[action.actionId] ?? 0) + Math.max(0, action.amount);
         return acc;
      }, {});

      const quests = await db.playerQuest.findMany({
         where: {
            playerId,
            questId: {
               in: activeQuestIds,
            },
            actionId: {
               in: Object.keys(totals),
            },
            OR: [
               { type: 'daily', periodKey: period.daily.key },
               { type: 'weekly', periodKey: period.weekly.key },
               { type: 'achievement', periodKey: period.achievementKey },
            ],
         },
         orderBy: [{ type: 'asc' }, { questId: 'asc' }],
      });

      const updates: QuestUpdateView[] = [];
      for (const quest of quests) {
         const amount = totals[quest.actionId] ?? 0;
         if (amount <= 0) {
            continue;
         }

         const nextProgress = Math.min(quest.required, quest.progress + amount);
         if (nextProgress === quest.progress) {
            continue;
         }

         const updated = await db.playerQuest.update({
            where: {
               playerId_questId_periodKey: {
                  playerId,
                  questId: quest.questId,
                  periodKey: quest.periodKey,
               },
            },
            data: {
               progress: nextProgress,
            },
         });

         updates.push(this.mapQuestUpdate(updated));
      }

      return updates;
   }

   async claimQuest(
      playerId: string,
      questId: number,
      idempotencyKey?: string,
      db: PrismaDbClient = this.prisma,
   ): Promise<{
      quest: QuestUpdateView;
      grantedRewards: RewardItem[];
      currency: Record<string, number>;
      dailyPoints?: number;
      weeklyPoints?: number;
   }> {
      const period = this.getPeriods(new Date());
      const definitions = await this.configCatalogService.getQuestDefinitions();
      await this.ensureState(db, playerId, period, definitions);

      const quest = await db.playerQuest.findFirst({
         where: {
            playerId,
            questId,
            OR: [
               { type: 'daily', periodKey: period.daily.key },
               { type: 'weekly', periodKey: period.weekly.key },
               { type: 'achievement', periodKey: period.achievementKey },
            ],
         },
      });

      if (!quest) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Quest ${questId} was not found`,
         );
      }

      if (quest.claimed) {
         throw new ApiErrorException(
            HttpStatus.CONFLICT,
            ApiErrorCode.AlreadyClaimed,
            `Quest ${questId} was already claimed`,
         );
      }

      if (quest.progress < quest.required) {
         throw new ApiErrorException(
            HttpStatus.BAD_REQUEST,
            ApiErrorCode.ValidationFailed,
            `Quest ${questId} is not completed yet`,
         );
      }

      const definition = definitions.quests.find(
         item => item.id === quest.questId && item.typeQuest === quest.type,
      );
      if (!definition) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Quest definition ${questId} was not found`,
         );
      }

      const claimedQuest = await db.playerQuest.update({
         where: {
            playerId_questId_periodKey: {
               playerId,
               questId: quest.questId,
               periodKey: quest.periodKey,
            },
         },
         data: {
            claimed: true,
         },
      });

      let dailyPoints: number | undefined;
      let weeklyPoints: number | undefined;
      if ((quest.type === 'daily' || quest.type === 'weekly') && (definition.points ?? 0) > 0) {
         const track = quest.type as QuestTrack;
         const rewardRows = await db.playerQuestProgressReward.findMany({
            where: {
               playerId,
               track,
               periodKey: track === 'daily' ? period.daily.key : period.weekly.key,
            },
         });
         const nextPoints = (rewardRows[0]?.points ?? 0) + (definition.points ?? 0);

         await db.playerQuestProgressReward.updateMany({
            where: {
               playerId,
               track,
               periodKey: track === 'daily' ? period.daily.key : period.weekly.key,
            },
            data: {
               points: nextPoints,
            },
         });

         if (track === 'daily') {
            dailyPoints = nextPoints;
         } else {
            weeklyPoints = nextPoints;
         }
      }

      const rewardResult = await this.rewardService.applyRewards({
         db,
         playerId,
         sourceType: 'quest',
         sourceId: `quest:${quest.questId}`,
         idempotencyKey,
         rewards: definition.reward,
      });

      return {
         quest: this.mapQuestUpdate(claimedQuest),
         grantedRewards: rewardResult.rewards,
         currency: rewardResult.currency,
         dailyPoints,
         weeklyPoints,
      };
   }

   async claimProgressReward(
      playerId: string,
      track: QuestTrack,
      stage: number,
      idempotencyKey?: string,
      db: PrismaDbClient = this.prisma,
   ): Promise<{
      track: QuestTrack;
      stage: number;
      claimed: boolean;
      grantedRewards: RewardItem[];
      currency: Record<string, number>;
   }> {
      const period = this.getPeriods(new Date());
      const definitions = await this.configCatalogService.getQuestDefinitions();
      await this.ensureState(db, playerId, period, definitions);

      const reward = await db.playerQuestProgressReward.findUnique({
         where: {
            playerId_track_stage_periodKey: {
               playerId,
               track,
               stage,
               periodKey: track === 'daily' ? period.daily.key : period.weekly.key,
            },
         },
      });

      if (!reward) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Progress reward ${track}:${stage} was not found`,
         );
      }

      const definition = definitions.progressRewards.find(
         item => item.track === track && item.stage === stage,
      );
      if (!definition) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Progress reward definition ${track}:${stage} was not found`,
         );
      }

      if (reward.claimed) {
         throw new ApiErrorException(
            HttpStatus.CONFLICT,
            ApiErrorCode.AlreadyClaimed,
            `Progress reward ${track}:${stage} was already claimed`,
         );
      }

      if (reward.points < stage) {
         throw new ApiErrorException(
            HttpStatus.BAD_REQUEST,
            ApiErrorCode.ValidationFailed,
            `Progress reward ${track}:${stage} is not unlocked yet`,
         );
      }

      await db.playerQuestProgressReward.update({
         where: {
            playerId_track_stage_periodKey: {
               playerId,
               track,
               stage,
               periodKey: reward.periodKey,
            },
         },
         data: {
            claimed: true,
         },
      });

      const grantedRewards = definition.reward;

      const rewardResult = await this.rewardService.applyRewards({
         db,
         playerId,
         sourceType: 'progress_reward',
         sourceId: `${track}:${stage}`,
         idempotencyKey,
         rewards: grantedRewards,
      });

      return {
         track,
         stage,
         claimed: true,
         grantedRewards: rewardResult.rewards,
         currency: rewardResult.currency,
      };
   }

   private async ensureState(
      db: PrismaDbClient,
      playerId: string,
      period: ReturnType<QuestService['getPeriods']>,
      definitions: Awaited<ReturnType<ConfigCatalogService['getQuestDefinitions']>>,
   ): Promise<void> {
      for (const definition of definitions.quests) {
         const periodKey = this.resolveQuestPeriodKey(definition.typeQuest, period);
         await db.playerQuest.upsert({
            where: {
               playerId_questId_periodKey: {
                  playerId,
                  questId: definition.id,
                  periodKey,
               },
            },
            update: {
               type: definition.typeQuest,
               actionId: definition.questActionId,
               required: definition.required,
            },
            create: {
               playerId,
               questId: definition.id,
               type: definition.typeQuest,
               actionId: definition.questActionId,
               progress: 0,
               required: definition.required,
               claimed: false,
               periodKey,
            },
         });
      }

      for (const definition of definitions.progressRewards) {
         const periodKey = definition.track === 'daily' ? period.daily.key : period.weekly.key;
         await db.playerQuestProgressReward.upsert({
            where: {
               playerId_track_stage_periodKey: {
                  playerId,
                  track: definition.track,
                  stage: definition.stage,
                  periodKey,
               },
            },
            update: {
               reward: definition.reward[0] ?? null,
            },
            create: {
               playerId,
               track: definition.track,
               stage: definition.stage,
               points: 0,
               periodKey,
               reward: definition.reward[0] ?? null,
               claimed: false,
            },
         });
      }
   }

   private resolveQuestPeriodKey(
      type: QuestType,
      period: ReturnType<QuestService['getPeriods']>,
   ): string {
      switch (type) {
         case 'daily':
            return period.daily.key;
         case 'weekly':
            return period.weekly.key;
         default:
            return period.achievementKey;
      }
   }

   private mapQuestViews(
      quests: Array<{
         questId: number;
         type: string;
         actionId: string;
         progress: number;
         required: number;
         claimed: boolean;
      }>,
      definitions: Array<{
         id: number;
         typeQuest: string;
         questActionId: string;
         desc: string;
         required: number;
         reward: RewardItem[];
      }>,
   ): QuestView[] {
      return quests.map(quest => {
         const definition = definitions.find(
            item => item.id === quest.questId && item.typeQuest === quest.type,
         );
         return {
            questId: quest.questId,
            type: quest.type as QuestType,
            actionId: quest.actionId,
            description: definition?.desc ?? quest.actionId,
            progress: quest.progress,
            required: quest.required,
            isCompleted: quest.progress >= quest.required,
            rewardClaimed: quest.claimed,
            rewards: definition?.reward ?? [],
         };
      });
   }

   private mapProgressRewardViews(
      rewards: Array<{
         stage: number;
         points: number;
         claimed: boolean;
         reward: unknown;
      }>,
   ): QuestProgressRewardView[] {
      return rewards.map(reward => ({
         stage: reward.stage,
         claimed: reward.claimed,
         isUnlocked: reward.points >= reward.stage,
         reward: (reward.reward as RewardItem) ?? {
            itemId: 'GO',
            quantity: 0,
            customData: null,
         },
      }));
   }

   private mapQuestUpdate(quest: {
      questId: number;
      type: string;
      actionId: string;
      progress: number;
      required: number;
      claimed: boolean;
   }): QuestUpdateView {
      return {
         questId: quest.questId,
         type: quest.type as QuestType,
         actionId: quest.actionId,
         progress: quest.progress,
         required: quest.required,
         isCompleted: quest.progress >= quest.required,
         rewardClaimed: quest.claimed,
      };
   }

   private getPeriods(date: Date) {
      return {
         daily: {
            key: this.formatUtcDate(date),
            resetAt: new Date(
               Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0),
            ),
         },
         weekly: {
            key: this.getWeeklyPeriodKey(date),
            resetAt: this.getNextUtcWeekStart(date),
         },
         achievementKey: 'lifetime',
      };
   }

   private getWeeklyPeriodKey(date: Date): string {
      const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
      const day = utcDate.getUTCDay() || 7;
      utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);

      const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
      const weekNumber = Math.ceil(
         ((utcDate.getTime() - yearStart.getTime()) / 86400000 + yearStart.getUTCDay() + 1) / 7,
      );

      return `${utcDate.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
   }

   private getNextUtcWeekStart(date: Date): Date {
      const nextDayStart = new Date(
         Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0),
      );

      while (nextDayStart.getUTCDay() !== 1) {
         nextDayStart.setUTCDate(nextDayStart.getUTCDate() + 1);
      }

      return nextDayStart;
   }

   private formatUtcDate(date: Date): string {
      return date.toISOString().slice(0, 10);
   }
}

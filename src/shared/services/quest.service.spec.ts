import { QuestService } from './quest.service';

describe('QuestService', () => {
   const questDefinitions = {
      quests: [
         {
            id: 1,
            typeQuest: 'daily',
            questActionId: 'PLAY_GAME',
            desc: 'Play 3 battles',
            required: 3,
            reward: [{ itemId: 'GE', quantity: 50, customData: null }],
            points: 2,
         },
         {
            id: 2,
            typeQuest: 'daily',
            questActionId: 'WIN_BATTLE',
            desc: 'Win 1 battle',
            required: 1,
            reward: [{ itemId: 'GO', quantity: 150, customData: null }],
            points: 2,
         },
         {
            id: 3,
            typeQuest: 'daily',
            questActionId: 'UPGRADE_UNIT',
            desc: 'Upgrade 1 hero',
            required: 1,
            reward: [{ itemId: 'NormalShard', quantity: 5, customData: null }],
            points: 2,
         },
         {
            id: 4,
            typeQuest: 'weekly',
            questActionId: 'PLAY_GAME',
            desc: 'Play 20 battles',
            required: 20,
            reward: [{ itemId: 'GE', quantity: 150, customData: null }],
            points: 4,
         },
         {
            id: 8,
            typeQuest: 'achievement',
            questActionId: 'WIN_BATTLE',
            desc: 'Win 25 battles',
            required: 25,
            reward: [{ itemId: 'GO', quantity: 1500, customData: null }],
         },
      ],
      progressRewards: [
         {
            kind: 'progressReward',
            track: 'daily',
            stage: 2,
            reward: [{ itemId: 'GE', quantity: 50, customData: null }],
         },
         {
            kind: 'progressReward',
            track: 'weekly',
            stage: 4,
            reward: [{ itemId: 'GO', quantity: 500, customData: null }],
         },
      ],
   };

   afterEach(() => {
      jest.useRealTimers();
   });

   it('returns canonical quest state with resetAt and rewardClaimed fields', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-08T12:00:00.000Z'));

      const configCatalogService = {
         getQuestDefinitions: jest.fn().mockResolvedValue(questDefinitions),
      };
      const rewardService = {
         applyRewards: jest.fn(),
      };
      const service = new QuestService({} as any, configCatalogService as any, rewardService as any);

      const db = {
         playerQuest: {
            upsert: jest.fn(),
            findMany: jest.fn().mockResolvedValue([
               {
                  questId: 1,
                  type: 'daily',
                  actionId: 'PLAY_GAME',
                  progress: 2,
                  required: 3,
                  claimed: false,
               },
               {
                  questId: 2,
                  type: 'daily',
                  actionId: 'WIN_BATTLE',
                  progress: 1,
                  required: 1,
                  claimed: true,
               },
               {
                  questId: 3,
                  type: 'daily',
                  actionId: 'UPGRADE_UNIT',
                  progress: 1,
                  required: 1,
                  claimed: false,
               },
               {
                  questId: 4,
                  type: 'weekly',
                  actionId: 'PLAY_GAME',
                  progress: 5,
                  required: 20,
                  claimed: false,
               },
               {
                  questId: 8,
                  type: 'achievement',
                  actionId: 'WIN_BATTLE',
                  progress: 2,
                  required: 25,
                  claimed: false,
               },
               {
                  questId: 102,
                  type: 'weekly',
                  actionId: 'UPGRADE_UNIT',
                  progress: 9,
                  required: 9,
                  claimed: false,
               },
            ]),
         },
         playerQuestProgressReward: {
            upsert: jest.fn(),
            findMany: jest.fn().mockResolvedValue([
               {
                  track: 'daily',
                  stage: 2,
                  points: 2,
                  claimed: false,
                  reward: { itemId: 'GE', quantity: 50, customData: null },
               },
               {
                  track: 'weekly',
                  stage: 4,
                  points: 0,
                  claimed: false,
                  reward: { itemId: 'GO', quantity: 500, customData: null },
               },
            ]),
         },
      };

      const state = await service.getState('p_quest', db);

      expect(state.daily.resetAt).toBe('2026-05-09T00:00:00.000Z');
      expect(state.weekly.resetAt).toBe('2026-05-11T00:00:00.000Z');
      expect(state.daily.points).toBe(2);
      expect(state.daily.quests.find(item => item.questId === 2)).toEqual({
         questId: 2,
         type: 'daily',
         actionId: 'WIN_BATTLE',
         description: 'Win 1 battle',
         progress: 1,
         required: 1,
         isCompleted: true,
         rewardClaimed: true,
         rewards: [{ itemId: 'GO', quantity: 150, customData: null }],
      });
      expect(state.daily.quests.find(item => item.questId === 3)).toEqual({
         questId: 3,
         type: 'daily',
         actionId: 'UPGRADE_UNIT',
         description: 'Upgrade 1 hero',
         progress: 1,
         required: 1,
         isCompleted: true,
         rewardClaimed: false,
         rewards: [{ itemId: 'NormalShard', quantity: 5, customData: null }],
      });
      expect(state.weekly.quests.find(item => item.questId === 102)).toBeUndefined();
      expect(state.daily.progressRewards).toEqual([
         {
            stage: 2,
            claimed: false,
            isUnlocked: true,
            reward: { itemId: 'GE', quantity: 50, customData: null },
         },
      ]);
   });

   it('returns canonical questUpdates when battle progress is applied', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-08T12:00:00.000Z'));

      const configCatalogService = {
         getQuestDefinitions: jest.fn().mockResolvedValue(questDefinitions),
      };
      const rewardService = {
         applyRewards: jest.fn(),
      };
      const service = new QuestService({} as any, configCatalogService as any, rewardService as any);

      const db = {
         playerQuest: {
            upsert: jest.fn(),
            findMany: jest.fn().mockResolvedValue([
               {
                  playerId: 'p_quest',
                  questId: 8,
                  type: 'achievement',
                  actionId: 'WIN_BATTLE',
                  progress: 1,
                  required: 25,
                  claimed: false,
                  periodKey: 'lifetime',
               },
               {
                  playerId: 'p_quest',
                  questId: 1,
                  type: 'daily',
                  actionId: 'PLAY_GAME',
                  progress: 1,
                  required: 3,
                  claimed: false,
                  periodKey: '2026-05-08',
               },
               {
                  playerId: 'p_quest',
                  questId: 2,
                  type: 'daily',
                  actionId: 'WIN_BATTLE',
                  progress: 0,
                  required: 1,
                  claimed: false,
                  periodKey: '2026-05-08',
               },
               {
                  playerId: 'p_quest',
                  questId: 4,
                  type: 'weekly',
                  actionId: 'PLAY_GAME',
                  progress: 1,
                  required: 20,
                  claimed: false,
                  periodKey: '2026-W19',
               },
               {
                  playerId: 'p_quest',
                  questId: 102,
                  type: 'weekly',
                  actionId: 'UPGRADE_UNIT',
                  progress: 4,
                  required: 4,
                  claimed: false,
                  periodKey: '2026-W19',
               },
            ]),
            update: jest
               .fn()
               .mockImplementation(({ where, data }) =>
                  Promise.resolve({
                     questId: where.playerId_questId_periodKey.questId,
                     type:
                        where.playerId_questId_periodKey.questId === 8
                           ? 'achievement'
                           : where.playerId_questId_periodKey.questId === 4
                             ? 'weekly'
                             : 'daily',
                     actionId:
                        where.playerId_questId_periodKey.questId === 8 ||
                        where.playerId_questId_periodKey.questId === 2
                           ? 'WIN_BATTLE'
                           : 'PLAY_GAME',
                     progress: data.progress,
                     required:
                        where.playerId_questId_periodKey.questId === 8
                           ? 25
                           : where.playerId_questId_periodKey.questId === 4
                             ? 20
                             : where.playerId_questId_periodKey.questId === 2
                               ? 1
                               : 3,
                     claimed: false,
                  }),
               ),
         },
         playerQuestProgressReward: {
            upsert: jest.fn(),
         },
      };

      const updates = await service.applyProgress(
         'p_quest',
         [
            { actionId: 'PLAY_GAME', amount: 1 },
            { actionId: 'WIN_BATTLE', amount: 1 },
         ],
         db,
      );

      expect(updates).toEqual([
         {
            questId: 8,
            type: 'achievement',
            actionId: 'WIN_BATTLE',
            progress: 2,
            required: 25,
            isCompleted: false,
            rewardClaimed: false,
         },
         {
            questId: 1,
            type: 'daily',
            actionId: 'PLAY_GAME',
            progress: 2,
            required: 3,
            isCompleted: false,
            rewardClaimed: false,
         },
         {
            questId: 2,
            type: 'daily',
            actionId: 'WIN_BATTLE',
            progress: 1,
            required: 1,
            isCompleted: true,
            rewardClaimed: false,
         },
         {
            questId: 4,
            type: 'weekly',
            actionId: 'PLAY_GAME',
            progress: 2,
            required: 20,
            isCompleted: false,
            rewardClaimed: false,
         },
      ]);
   });

   it('claims quest 3 from active config and grants NormalShard x5 into currency', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-08T12:00:00.000Z'));

      const configCatalogService = {
         getQuestDefinitions: jest.fn().mockResolvedValue(questDefinitions),
      };
      const rewardService = {
         applyRewards: jest.fn().mockResolvedValue({
            rewards: [{ itemId: 'NormalShard', quantity: 5, customData: null }],
            currency: {
               peasant: 0,
               gold: 1171,
               gem: 0,
               normalShard: 7,
               eliteShard: 0,
               specialShard: 0,
            },
         }),
      };
      const service = new QuestService({} as any, configCatalogService as any, rewardService as any);

      const db = {
         playerQuest: {
            upsert: jest.fn(),
            findFirst: jest.fn().mockResolvedValue({
               playerId: 'p_quest',
               questId: 3,
               type: 'daily',
               actionId: 'UPGRADE_UNIT',
               progress: 1,
               required: 1,
               claimed: false,
               periodKey: '2026-05-08',
            }),
            update: jest.fn().mockResolvedValue({
               questId: 3,
               type: 'daily',
               actionId: 'UPGRADE_UNIT',
               progress: 1,
               required: 1,
               claimed: true,
            }),
         },
         playerQuestProgressReward: {
            upsert: jest.fn(),
            findMany: jest.fn().mockResolvedValue([
               {
                  playerId: 'p_quest',
                  track: 'daily',
                  stage: 2,
                  points: 0,
                  periodKey: '2026-05-08',
                  reward: { itemId: 'GE', quantity: 50, customData: null },
                  claimed: false,
               },
            ]),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
         },
      };

      const result = await service.claimQuest(
         'p_quest',
         3,
         'quest-claim-key',
         db,
      );

      expect(result).toEqual({
         quest: {
            questId: 3,
            type: 'daily',
            actionId: 'UPGRADE_UNIT',
            progress: 1,
            required: 1,
            isCompleted: true,
            rewardClaimed: true,
         },
         grantedRewards: [{ itemId: 'NormalShard', quantity: 5, customData: null }],
         currency: {
            peasant: 0,
            gold: 1171,
            gem: 0,
            normalShard: 7,
            eliteShard: 0,
            specialShard: 0,
         },
         dailyPoints: 2,
         weeklyPoints: undefined,
      });
      expect(db.playerQuestProgressReward.updateMany).toHaveBeenCalledWith({
         where: {
            playerId: 'p_quest',
            track: 'daily',
            periodKey: '2026-05-08',
         },
         data: {
            points: 2,
         },
      });
   });

   it('claims an unlocked progress reward and returns applied currency', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-08T12:00:00.000Z'));

      const configCatalogService = {
         getQuestDefinitions: jest.fn().mockResolvedValue(questDefinitions),
      };
      const rewardService = {
         applyRewards: jest.fn().mockResolvedValue({
            rewards: [{ itemId: 'GE', quantity: 50, customData: null }],
            currency: {
               peasant: 0,
               gold: 700,
               gem: 50,
               normalShard: 0,
               eliteShard: 0,
               specialShard: 0,
            },
         }),
      };
      const service = new QuestService({} as any, configCatalogService as any, rewardService as any);

      const db = {
         playerQuest: {
            upsert: jest.fn(),
         },
         playerQuestProgressReward: {
            upsert: jest.fn(),
            findUnique: jest.fn().mockResolvedValue({
               playerId: 'p_quest',
               track: 'daily',
               stage: 2,
               points: 2,
               periodKey: '2026-05-08',
               reward: { itemId: 'GE', quantity: 50, customData: null },
               claimed: false,
            }),
            update: jest.fn().mockResolvedValue({}),
         },
      };

      const result = await service.claimProgressReward(
         'p_quest',
         'daily',
         2,
         'progress-claim-key',
         db,
      );

      expect(result).toEqual({
         track: 'daily',
         stage: 2,
         claimed: true,
         grantedRewards: [{ itemId: 'GE', quantity: 50, customData: null }],
         currency: {
            peasant: 0,
            gold: 700,
            gem: 50,
            normalShard: 0,
            eliteShard: 0,
            specialShard: 0,
         },
      });
   });
});

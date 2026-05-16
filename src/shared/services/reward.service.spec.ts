import { RewardService } from './reward.service';

describe('RewardService', () => {
   it('levels up on the exact XP threshold and keeps exp inside the new level', async () => {
      const configCatalogService = {
         getAccountLevelRules: jest.fn().mockResolvedValue([
            { level: 1, requiredExp: 0, rewards: [] },
            { level: 2, requiredExp: 50, rewards: [{ itemId: 'GO', quantity: 100, customData: null }] },
            { level: 3, requiredExp: 150, rewards: [{ itemId: 'GE', quantity: 50, customData: null }] },
         ]),
      };

      const service = new RewardService({} as any, configCatalogService as any);
      const db = {
         player: {
            findUnique: jest.fn().mockResolvedValue({
               id: 'p_level',
               currency: {
                  gold: 600,
               },
               statistics: {
                  level: 1,
                  exp: 0,
                  score: 0,
                  trophy: 0,
               },
            }),
            update: jest.fn().mockResolvedValue(undefined),
         },
         rewardTransaction: {
            create: jest.fn().mockResolvedValue(undefined),
         },
      };

      const result = await service.applyRewards({
         db,
         playerId: 'p_level',
         sourceType: 'battle',
         sourceId: 'b_level',
         rewards: [{ itemId: 'XP', quantity: 50, customData: null }],
      });

      expect(result.playerDelta).toEqual({
         levelBefore: 1,
         levelAfter: 2,
         scoreBefore: 0,
         scoreAfter: 0,
         expBefore: 0,
         expAfter: 0,
      });
      expect(result.statistics.level).toBe(2);
      expect(result.statistics.exp).toBe(0);
      expect(result.currency.gold).toBe(700);
      expect(result.rewards).toEqual([
         { itemId: 'XP', quantity: 50, customData: null },
         { itemId: 'GO', quantity: 100, customData: null },
      ]);
   });

   it('keeps partial XP below the threshold in the current level', async () => {
      const configCatalogService = {
         getAccountLevelRules: jest.fn().mockResolvedValue([
            { level: 1, requiredExp: 0, rewards: [] },
            { level: 2, requiredExp: 50, rewards: [{ itemId: 'GO', quantity: 100, customData: null }] },
         ]),
      };

      const service = new RewardService({} as any, configCatalogService as any);
      const db = {
         player: {
            findUnique: jest.fn().mockResolvedValue({
               id: 'p_level',
               currency: {
                  gold: 600,
               },
               statistics: {
                  level: 1,
                  exp: 10,
                  score: 0,
                  trophy: 0,
               },
            }),
            update: jest.fn().mockResolvedValue(undefined),
         },
         rewardTransaction: {
            create: jest.fn().mockResolvedValue(undefined),
         },
      };

      const result = await service.applyRewards({
         db,
         playerId: 'p_level',
         sourceType: 'battle',
         sourceId: 'b_partial',
         rewards: [{ itemId: 'XP', quantity: 20, customData: null }],
      });

      expect(result.playerDelta.levelAfter).toBe(1);
      expect(result.playerDelta.expAfter).toBe(30);
      expect(result.statistics.level).toBe(1);
      expect(result.statistics.exp).toBe(30);
      expect(result.rewards).toEqual([{ itemId: 'XP', quantity: 20, customData: null }]);
   });

   it('carries overflow XP into the next level', async () => {
      const configCatalogService = {
         getAccountLevelRules: jest.fn().mockResolvedValue([
            { level: 1, requiredExp: 0, rewards: [] },
            { level: 2, requiredExp: 50, rewards: [{ itemId: 'GO', quantity: 100, customData: null }] },
            { level: 3, requiredExp: 150, rewards: [{ itemId: 'GE', quantity: 50, customData: null }] },
         ]),
      };

      const service = new RewardService({} as any, configCatalogService as any);
      const db = {
         player: {
            findUnique: jest.fn().mockResolvedValue({
               id: 'p_level',
               currency: {
                  gold: 600,
               },
               statistics: {
                  level: 1,
                  exp: 40,
                  score: 0,
                  trophy: 0,
               },
            }),
            update: jest.fn().mockResolvedValue(undefined),
         },
         rewardTransaction: {
            create: jest.fn().mockResolvedValue(undefined),
         },
      };

      const result = await service.applyRewards({
         db,
         playerId: 'p_level',
         sourceType: 'battle',
         sourceId: 'b_overflow',
         rewards: [{ itemId: 'XP', quantity: 80, customData: null }],
      });

      expect(result.playerDelta.levelAfter).toBe(2);
      expect(result.playerDelta.expAfter).toBe(70);
      expect(result.statistics.level).toBe(2);
      expect(result.statistics.exp).toBe(70);
      expect(result.currency.gold).toBe(700);
      expect(result.rewards).toEqual([
         { itemId: 'XP', quantity: 80, customData: null },
         { itemId: 'GO', quantity: 100, customData: null },
      ]);
   });
});

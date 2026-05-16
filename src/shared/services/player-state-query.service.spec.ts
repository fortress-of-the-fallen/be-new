import { buildDefaultTutorialProgress } from './tutorial-progress.constant';
import { PlayerStateQueryService } from './player-state-query.service';

describe('PlayerStateQueryService', () => {
   it('hydrates missing currency and statistics fields in the /me snapshot', async () => {
      const questService = {
         getState: jest.fn().mockResolvedValue({
            daily: {
               resetAt: '2026-05-09T00:00:00.000Z',
               points: 0,
               quests: [],
               progressRewards: [],
            },
            weekly: {
               resetAt: '2026-05-11T00:00:00.000Z',
               points: 0,
               quests: [],
               progressRewards: [],
            },
            achievement: {
               quests: [],
            },
         }),
      };

      const tutorialProgressService = {
         normalize: jest.fn().mockReturnValue(
            buildDefaultTutorialProgress(new Date('2026-05-08T00:00:00.000Z')),
         ),
      };

      const service = new PlayerStateQueryService(
         {} as any,
         questService as any,
         tutorialProgressService as any,
      );

      const db = {
         player: {
            findUnique: jest.fn().mockResolvedValue({
               id: 'p_legacy',
               profile: {
                  username: 'legacy-player',
                  displayName: 'Legacy Player',
                  avatar: 'normal',
                  country: 'VN',
               },
               statistics: {
                  level: 2,
                  exp: 25,
               },
               tutorialProgress: null,
               currency: {
                  gold: 580,
               },
               configVersion: '2026.05.02.1',
               updatedAt: new Date('2026-05-08T00:00:00.000Z'),
               account: {
                  username: 'legacy-player',
               },
            }),
         },
         playerInventoryItem: {
            findMany: jest.fn().mockResolvedValue([]),
         },
         playerFormation: {
            findUnique: jest.fn().mockResolvedValue(null),
         },
      };

      const result = await service.getPlayerOverview('p_legacy', db);

      expect(result.username).toBe('legacy-player');
      expect(result.currency).toEqual({
         peasant: 0,
         gold: 580,
         gem: 0,
         normalShard: 0,
         eliteShard: 0,
         specialShard: 0,
      });
      expect(result.statistics).toEqual({
         levelMap: 1,
         wave: 1,
         gameCoin: 0,
         expBattle: 0,
         levelBattle: 0,
         level: 2,
         exp: 25,
         statPointsAvailable: 0,
         statPointsSpent: 0,
         coreStats: {
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0,
         },
         karma: 0,
         affinity: 0,
         luck: 0,
         resistance: 0,
         changedName: 0,
         score: 0,
         trophy: 0,
         levelCastle: 0,
         stageCampaign: 1,
         battlesPlayed: 0,
         battlesWon: 0,
         lobbyUpgradeSpent: 0,
      });
      expect(result.formation).toEqual({
         name: 'active',
         slots: [],
      });
   });
});

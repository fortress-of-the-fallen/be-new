jest.mock('src/shared/helper/identity.helper', () => ({
   IdentityHelper: {
      generateNanoID: jest.fn().mockReturnValue('fixedbattle'),
   },
}));

import { StartBattleApplicationService } from './start-battle.application-service';

describe('StartBattleApplicationService', () => {
   it('creates a PVP battle session even when no matchmaking opponent is available', async () => {
      const prisma = {
         playerFormation: {
            findUnique: jest.fn().mockResolvedValue({
               playerId: 'p_1',
               name: 'active',
            }),
         },
         battleSession: {
            create: jest.fn().mockResolvedValue(undefined),
         },
      };
      const configCatalogService = {
         assertConfigVersion: jest.fn().mockResolvedValue(undefined),
      };
      const leaderboardService = {
         getMatchmakingOpponents: jest.fn().mockResolvedValue({
            opponents: [],
         }),
      };

      const service = new StartBattleApplicationService(
         prisma as any,
         configCatalogService as any,
         leaderboardService as any,
      );

      const result = await service.start('p_1', 'PVP', 'active', '2026.05.02.1');

      expect(configCatalogService.assertConfigVersion).toHaveBeenCalledWith('2026.05.02.1');
      expect(leaderboardService.getMatchmakingOpponents).toHaveBeenCalledWith('p_1', 'PVP');
      expect(prisma.battleSession.create).toHaveBeenCalledTimes(1);
      expect(result.mode).toBe('PVP');
      expect(result.opponent).toBeUndefined();
      expect(result.configVersion).toBe('2026.05.02.1');
      expect(result.battleId).toMatch(/^b_/);
   });
});

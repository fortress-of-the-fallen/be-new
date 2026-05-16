jest.mock('src/features/leaderboard/application', () => ({
   LeaderboardApplicationService: class LeaderboardApplicationService {},
}));

import { MatchmakingController } from './matchmaking.controller';

describe('MatchmakingController', () => {
   it('uses default PVP mode when query mode is omitted', async () => {
      const leaderboardApplicationService = { getOpponents: jest.fn().mockResolvedValue([{ playerId: 'p2' }]) };
      const controller = new MatchmakingController(leaderboardApplicationService as any);

      const result = await controller.getOpponents({ playerId: 'p1' } as any);

      expect(leaderboardApplicationService.getOpponents).toHaveBeenCalledWith('p1', 'PVP');
      expect(result.data).toEqual([{ playerId: 'p2' }]);
   });

   it('passes explicit mode to leaderboard service', async () => {
      const leaderboardApplicationService = { getOpponents: jest.fn().mockResolvedValue([{ playerId: 'p3' }]) };
      const controller = new MatchmakingController(leaderboardApplicationService as any);

      const result = await controller.getOpponents({ playerId: 'p1' } as any, 'PVE');

      expect(leaderboardApplicationService.getOpponents).toHaveBeenCalledWith('p1', 'PVE');
      expect(result.data).toEqual([{ playerId: 'p3' }]);
   });
});

jest.mock('src/features/leaderboard/application', () => ({
   LeaderboardApplicationService: class LeaderboardApplicationService {},
}));

import { LeaderboardController } from './leaderboard.controller';

describe('LeaderboardController', () => {
   it('getLeaderboard delegates type and limit', async () => {
      const leaderboardApplicationService = { getLeaderboard: jest.fn().mockResolvedValue([{ playerId: 'p1' }]) };
      const controller = new LeaderboardController(leaderboardApplicationService as any);

      const result = await controller.getLeaderboard('score', 50);

      expect(leaderboardApplicationService.getLeaderboard).toHaveBeenCalledWith('score', 50);
      expect(result.data).toEqual([{ playerId: 'p1' }]);
   });

   it('getMyRank delegates type and playerId', async () => {
      const leaderboardApplicationService = { getMyRank: jest.fn().mockResolvedValue({ rank: 7 }) };
      const controller = new LeaderboardController(leaderboardApplicationService as any);

      const result = await controller.getMyRank('campaign', { playerId: 'p1' } as any);

      expect(leaderboardApplicationService.getMyRank).toHaveBeenCalledWith('campaign', 'p1');
      expect(result.data).toEqual({ rank: 7 });
   });
});

import { LeaderboardApplicationService } from './leaderboard.application-service';

describe('LeaderboardApplicationService', () => {
   it('delegates leaderboard, my-rank, and opponents lookups', async () => {
      const getLeaderboardApplicationService = { getLeaderboard: jest.fn().mockResolvedValue([{ playerId: 'p1' }]) };
      const getMyRankApplicationService = { getMyRank: jest.fn().mockResolvedValue({ rank: 1 }) };
      const getMatchmakingOpponentsApplicationService = {
         getOpponents: jest.fn().mockResolvedValue([{ playerId: 'p2' }]),
      };
      const service = new LeaderboardApplicationService(
         getLeaderboardApplicationService as any,
         getMyRankApplicationService as any,
         getMatchmakingOpponentsApplicationService as any,
      );

      await expect(service.getLeaderboard('score', 20)).resolves.toEqual([{ playerId: 'p1' }]);
      await expect(service.getMyRank('score', 'p1')).resolves.toEqual({ rank: 1 });
      await expect(service.getOpponents('p1', 'PVP')).resolves.toEqual([{ playerId: 'p2' }]);

      expect(getLeaderboardApplicationService.getLeaderboard).toHaveBeenCalledWith('score', 20);
      expect(getMyRankApplicationService.getMyRank).toHaveBeenCalledWith('score', 'p1');
      expect(getMatchmakingOpponentsApplicationService.getOpponents).toHaveBeenCalledWith('p1', 'PVP');
   });
});

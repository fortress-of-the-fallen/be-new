import { Injectable } from '@nestjs/common';
import { GetLeaderboardApplicationService } from './get-leaderboard';
import { GetMatchmakingOpponentsApplicationService } from './get-matchmaking-opponents';
import { GetMyRankApplicationService } from './get-my-rank';

@Injectable()
export class LeaderboardApplicationService {
   constructor(
      private readonly getLeaderboardApplicationService: GetLeaderboardApplicationService,
      private readonly getMyRankApplicationService: GetMyRankApplicationService,
      private readonly getMatchmakingOpponentsApplicationService: GetMatchmakingOpponentsApplicationService,
   ) {}

   async getLeaderboard(type: 'score' | 'level' | 'campaign', limit: number) {
      return this.getLeaderboardApplicationService.getLeaderboard(type, limit);
   }

   async getMyRank(type: 'score' | 'level' | 'campaign', playerId: string) {
      return this.getMyRankApplicationService.getMyRank(type, playerId);
   }

   async getOpponents(playerId: string, mode: string) {
      return this.getMatchmakingOpponentsApplicationService.getOpponents(playerId, mode);
   }
}

import { Injectable } from '@nestjs/common';
import { LeaderboardService } from 'src/shared/services/leaderboard.service';

@Injectable()
export class GetMyRankApplicationService {
   constructor(private readonly leaderboardService: LeaderboardService) {}

   async getMyRank(type: 'score' | 'level' | 'campaign', playerId: string) {
      return this.leaderboardService.getMyRank(type, playerId);
   }
}

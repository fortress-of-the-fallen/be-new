import { Injectable } from '@nestjs/common';
import { LeaderboardService } from 'src/shared/services/leaderboard.service';

@Injectable()
export class GetLeaderboardApplicationService {
   constructor(private readonly leaderboardService: LeaderboardService) {}

   async getLeaderboard(type: 'score' | 'level' | 'campaign', limit = 100) {
      return this.leaderboardService.getLeaderboard(type, limit);
   }
}

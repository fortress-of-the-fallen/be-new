import { Injectable } from '@nestjs/common';
import { LeaderboardService } from 'src/shared/services/leaderboard.service';

@Injectable()
export class GetMatchmakingOpponentsApplicationService {
   constructor(private readonly leaderboardService: LeaderboardService) {}

   async getOpponents(playerId: string, mode: string) {
      return this.leaderboardService.getMatchmakingOpponents(playerId, mode);
   }
}

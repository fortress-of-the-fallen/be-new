import { Module } from '@nestjs/common';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';
import {
   GetLeaderboardApplicationService,
   GetMatchmakingOpponentsApplicationService,
   GetMyRankApplicationService,
   LeaderboardApplicationService,
} from './application';

@Module({
   imports: [SharedServicesModule],
   providers: [
      LeaderboardApplicationService,
      GetLeaderboardApplicationService,
      GetMyRankApplicationService,
      GetMatchmakingOpponentsApplicationService,
   ],
   exports: [LeaderboardApplicationService],
})
export class LeaderboardModule {}

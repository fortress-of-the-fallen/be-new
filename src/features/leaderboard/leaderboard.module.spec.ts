import 'reflect-metadata';

jest.mock('./application', () => ({
   GetLeaderboardApplicationService: class GetLeaderboardApplicationService {},
   GetMatchmakingOpponentsApplicationService: class GetMatchmakingOpponentsApplicationService {},
   GetMyRankApplicationService: class GetMyRankApplicationService {},
   LeaderboardApplicationService: class LeaderboardApplicationService {},
}));
jest.mock('src/shared/services/shared-services.module', () => ({
   SharedServicesModule: class SharedServicesModule {},
}));

import { LeaderboardModule } from './leaderboard.module';
import {
   GetLeaderboardApplicationService,
   GetMatchmakingOpponentsApplicationService,
   GetMyRankApplicationService,
   LeaderboardApplicationService,
} from './application';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';

describe('LeaderboardModule', () => {
   it('registers imports, providers, and exports', () => {
      expect(Reflect.getMetadata('imports', LeaderboardModule)).toEqual([SharedServicesModule]);
      expect(Reflect.getMetadata('providers', LeaderboardModule)).toEqual([
         LeaderboardApplicationService,
         GetLeaderboardApplicationService,
         GetMyRankApplicationService,
         GetMatchmakingOpponentsApplicationService,
      ]);
      expect(Reflect.getMetadata('exports', LeaderboardModule)).toEqual([LeaderboardApplicationService]);
   });
});

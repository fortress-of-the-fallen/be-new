import { Module } from '@nestjs/common';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { ConfigCatalogService } from './config-catalog.service';
import { IdempotencyService } from './idempotency.service';
import { RewardService } from './reward.service';
import { LeaderboardService } from './leaderboard.service';
import { QuestService } from './quest.service';
import { PlayerStateQueryService } from './player-state-query.service';

@Module({
   imports: [PersistenceModule],
   providers: [
      ConfigCatalogService,
      IdempotencyService,
      RewardService,
      LeaderboardService,
      QuestService,
      PlayerStateQueryService,
   ],
   exports: [
      ConfigCatalogService,
      IdempotencyService,
      RewardService,
      LeaderboardService,
      QuestService,
      PlayerStateQueryService,
   ],
})
export class SharedServicesModule {}

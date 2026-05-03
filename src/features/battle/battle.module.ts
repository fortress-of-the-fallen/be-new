import { Module } from '@nestjs/common';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';
import {
   BattleApplicationService,
   FinishBattleApplicationService,
   StartBattleApplicationService,
} from './application';

@Module({
   imports: [PersistenceModule, SharedServicesModule],
   providers: [
      BattleApplicationService,
      StartBattleApplicationService,
      FinishBattleApplicationService,
   ],
   exports: [BattleApplicationService],
})
export class BattleModule {}

import { Module } from '@nestjs/common';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';
import {
   GetCurrentPlayerApplicationService,
   PlayerApplicationService,
   UpdateProfileApplicationService,
   UpdateTutorialProgressApplicationService,
} from './application';

@Module({
   imports: [PersistenceModule, SharedServicesModule],
   providers: [
      PlayerApplicationService,
      GetCurrentPlayerApplicationService,
      UpdateProfileApplicationService,
      UpdateTutorialProgressApplicationService,
   ],
   exports: [PlayerApplicationService],
})
export class PlayerModule {}

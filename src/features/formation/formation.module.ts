import { Module } from '@nestjs/common';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';
import {
   FormationApplicationService,
   GetFormationApplicationService,
   UpdateFormationApplicationService,
} from './application';

@Module({
   imports: [PersistenceModule, SharedServicesModule],
   providers: [
      FormationApplicationService,
      GetFormationApplicationService,
      UpdateFormationApplicationService,
   ],
   exports: [FormationApplicationService],
})
export class FormationModule {}

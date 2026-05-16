import { Module } from '@nestjs/common';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';
import {
   ClaimProgressRewardApplicationService,
   ClaimQuestApplicationService,
   GetQuestsApplicationService,
   QuestApplicationService,
} from './application';

@Module({
   imports: [PersistenceModule, SharedServicesModule],
   providers: [
      QuestApplicationService,
      GetQuestsApplicationService,
      ClaimQuestApplicationService,
      ClaimProgressRewardApplicationService,
   ],
   exports: [QuestApplicationService],
})
export class QuestModule {}

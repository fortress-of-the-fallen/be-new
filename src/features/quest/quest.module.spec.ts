import 'reflect-metadata';

jest.mock('./application', () => ({
   ClaimProgressRewardApplicationService: class ClaimProgressRewardApplicationService {},
   ClaimQuestApplicationService: class ClaimQuestApplicationService {},
   GetQuestsApplicationService: class GetQuestsApplicationService {},
   QuestApplicationService: class QuestApplicationService {},
}));
jest.mock('src/infrastructure/persistence/persistence.module', () => ({
   PersistenceModule: class PersistenceModule {},
}));
jest.mock('src/shared/services/shared-services.module', () => ({
   SharedServicesModule: class SharedServicesModule {},
}));

import { QuestModule } from './quest.module';
import {
   ClaimProgressRewardApplicationService,
   ClaimQuestApplicationService,
   GetQuestsApplicationService,
   QuestApplicationService,
} from './application';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';

describe('QuestModule', () => {
   it('registers imports, providers, and exports', () => {
      expect(Reflect.getMetadata('imports', QuestModule)).toEqual([PersistenceModule, SharedServicesModule]);
      expect(Reflect.getMetadata('providers', QuestModule)).toEqual([
         QuestApplicationService,
         GetQuestsApplicationService,
         ClaimQuestApplicationService,
         ClaimProgressRewardApplicationService,
      ]);
      expect(Reflect.getMetadata('exports', QuestModule)).toEqual([QuestApplicationService]);
   });
});

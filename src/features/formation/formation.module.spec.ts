import 'reflect-metadata';

jest.mock('./application', () => ({
   FormationApplicationService: class FormationApplicationService {},
   GetFormationApplicationService: class GetFormationApplicationService {},
   UpdateFormationApplicationService: class UpdateFormationApplicationService {},
}));
jest.mock('src/infrastructure/persistence/persistence.module', () => ({
   PersistenceModule: class PersistenceModule {},
}));
jest.mock('src/shared/services/shared-services.module', () => ({
   SharedServicesModule: class SharedServicesModule {},
}));

import { FormationModule } from './formation.module';
import { FormationApplicationService, GetFormationApplicationService, UpdateFormationApplicationService } from './application';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';

describe('FormationModule', () => {
   it('registers imports, providers, and exports', () => {
      expect(Reflect.getMetadata('imports', FormationModule)).toEqual([PersistenceModule, SharedServicesModule]);
      expect(Reflect.getMetadata('providers', FormationModule)).toEqual([
         FormationApplicationService,
         GetFormationApplicationService,
         UpdateFormationApplicationService,
      ]);
      expect(Reflect.getMetadata('exports', FormationModule)).toEqual([FormationApplicationService]);
   });
});

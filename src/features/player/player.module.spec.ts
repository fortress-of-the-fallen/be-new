import 'reflect-metadata';

jest.mock('./application', () => ({
   GetCurrentPlayerApplicationService: class GetCurrentPlayerApplicationService {},
   PlayerApplicationService: class PlayerApplicationService {},
   UpdateProfileApplicationService: class UpdateProfileApplicationService {},
   UpdateTutorialProgressApplicationService: class UpdateTutorialProgressApplicationService {},
}));
jest.mock('src/infrastructure/persistence/persistence.module', () => ({
   PersistenceModule: class PersistenceModule {},
}));
jest.mock('src/shared/services/shared-services.module', () => ({
   SharedServicesModule: class SharedServicesModule {},
}));

import { PlayerModule } from './player.module';
import {
   GetCurrentPlayerApplicationService,
   PlayerApplicationService,
   UpdateProfileApplicationService,
   UpdateTutorialProgressApplicationService,
} from './application';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';

describe('PlayerModule', () => {
   it('registers imports, providers, and exports', () => {
      expect(Reflect.getMetadata('imports', PlayerModule)).toEqual([PersistenceModule, SharedServicesModule]);
      expect(Reflect.getMetadata('providers', PlayerModule)).toEqual([
         PlayerApplicationService,
         GetCurrentPlayerApplicationService,
         UpdateProfileApplicationService,
         UpdateTutorialProgressApplicationService,
      ]);
      expect(Reflect.getMetadata('exports', PlayerModule)).toEqual([PlayerApplicationService]);
   });
});

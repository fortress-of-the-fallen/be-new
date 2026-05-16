import 'reflect-metadata';

jest.mock('./application', () => ({
   LobbyApplicationService: class LobbyApplicationService {},
   UpgradeCastleApplicationService: class UpgradeCastleApplicationService {},
}));
jest.mock('src/infrastructure/persistence/persistence.module', () => ({
   PersistenceModule: class PersistenceModule {},
}));
jest.mock('src/shared/services/shared-services.module', () => ({
   SharedServicesModule: class SharedServicesModule {},
}));

import { LobbyModule } from './lobby.module';
import { LobbyApplicationService, UpgradeCastleApplicationService } from './application';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';

describe('LobbyModule', () => {
   it('registers imports, providers, and exports', () => {
      expect(Reflect.getMetadata('imports', LobbyModule)).toEqual([PersistenceModule, SharedServicesModule]);
      expect(Reflect.getMetadata('providers', LobbyModule)).toEqual([
         LobbyApplicationService,
         UpgradeCastleApplicationService,
      ]);
      expect(Reflect.getMetadata('exports', LobbyModule)).toEqual([LobbyApplicationService]);
   });
});

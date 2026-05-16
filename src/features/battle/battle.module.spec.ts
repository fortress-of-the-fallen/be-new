import 'reflect-metadata';

jest.mock('./application', () => ({
   BattleApplicationService: class BattleApplicationService {},
   FinishBattleApplicationService: class FinishBattleApplicationService {},
   StartBattleApplicationService: class StartBattleApplicationService {},
}));
jest.mock('src/infrastructure/persistence/persistence.module', () => ({
   PersistenceModule: class PersistenceModule {},
}));
jest.mock('src/shared/services/shared-services.module', () => ({
   SharedServicesModule: class SharedServicesModule {},
}));

import { BattleModule } from './battle.module';
import {
   BattleApplicationService,
   FinishBattleApplicationService,
   StartBattleApplicationService,
} from './application';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';

describe('BattleModule', () => {
   it('registers imports, providers, and exports', () => {
      expect(Reflect.getMetadata('imports', BattleModule)).toEqual([PersistenceModule, SharedServicesModule]);
      expect(Reflect.getMetadata('providers', BattleModule)).toEqual([
         BattleApplicationService,
         StartBattleApplicationService,
         FinishBattleApplicationService,
      ]);
      expect(Reflect.getMetadata('exports', BattleModule)).toEqual([BattleApplicationService]);
   });
});

import 'reflect-metadata';

jest.mock('./application', () => ({
   EvolveHeroApplicationService: class EvolveHeroApplicationService {},
   GetInventoryApplicationService: class GetInventoryApplicationService {},
   InventoryApplicationService: class InventoryApplicationService {},
   PurchaseSkillApplicationService: class PurchaseSkillApplicationService {},
   UpgradeHeroApplicationService: class UpgradeHeroApplicationService {},
   UpgradeSkillApplicationService: class UpgradeSkillApplicationService {},
}));
jest.mock('src/infrastructure/persistence/persistence.module', () => ({
   PersistenceModule: class PersistenceModule {},
}));
jest.mock('src/shared/services/shared-services.module', () => ({
   SharedServicesModule: class SharedServicesModule {},
}));

import { InventoryModule } from './inventory.module';
import {
   EvolveHeroApplicationService,
   GetInventoryApplicationService,
   InventoryApplicationService,
   PurchaseSkillApplicationService,
   UpgradeHeroApplicationService,
   UpgradeSkillApplicationService,
} from './application';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';

describe('InventoryModule', () => {
   it('registers imports, providers, and exports', () => {
      expect(Reflect.getMetadata('imports', InventoryModule)).toEqual([PersistenceModule, SharedServicesModule]);
      expect(Reflect.getMetadata('providers', InventoryModule)).toEqual([
         InventoryApplicationService,
         GetInventoryApplicationService,
         UpgradeHeroApplicationService,
         EvolveHeroApplicationService,
         PurchaseSkillApplicationService,
         UpgradeSkillApplicationService,
      ]);
      expect(Reflect.getMetadata('exports', InventoryModule)).toEqual([InventoryApplicationService]);
   });
});

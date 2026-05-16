import 'reflect-metadata';

jest.mock('./application', () => ({
   GetShopCatalogApplicationService: class GetShopCatalogApplicationService {},
   PurchaseShopOfferApplicationService: class PurchaseShopOfferApplicationService {},
   ShopApplicationService: class ShopApplicationService {},
}));
jest.mock('src/infrastructure/persistence/persistence.module', () => ({
   PersistenceModule: class PersistenceModule {},
}));
jest.mock('src/shared/services/shared-services.module', () => ({
   SharedServicesModule: class SharedServicesModule {},
}));

import { ShopModule } from './shop.module';
import { GetShopCatalogApplicationService, PurchaseShopOfferApplicationService, ShopApplicationService } from './application';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';

describe('ShopModule', () => {
   it('registers imports, providers, and exports', () => {
      expect(Reflect.getMetadata('imports', ShopModule)).toEqual([PersistenceModule, SharedServicesModule]);
      expect(Reflect.getMetadata('providers', ShopModule)).toEqual([
         ShopApplicationService,
         GetShopCatalogApplicationService,
         PurchaseShopOfferApplicationService,
      ]);
      expect(Reflect.getMetadata('exports', ShopModule)).toEqual([ShopApplicationService]);
   });
});

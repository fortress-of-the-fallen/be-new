import { Module } from '@nestjs/common';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';
import {
   GetShopCatalogApplicationService,
   PurchaseShopOfferApplicationService,
   ShopApplicationService,
} from './application';

@Module({
   imports: [PersistenceModule, SharedServicesModule],
   providers: [
      ShopApplicationService,
      GetShopCatalogApplicationService,
      PurchaseShopOfferApplicationService,
   ],
   exports: [ShopApplicationService],
})
export class ShopModule {}

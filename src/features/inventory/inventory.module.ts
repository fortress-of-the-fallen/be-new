import { Module } from '@nestjs/common';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';
import {
   EvolveHeroApplicationService,
   GetInventoryApplicationService,
   InventoryApplicationService,
   PurchaseSkillApplicationService,
   UpgradeHeroApplicationService,
   UpgradeSkillApplicationService,
} from './application';

@Module({
   imports: [PersistenceModule, SharedServicesModule],
   providers: [
      InventoryApplicationService,
      GetInventoryApplicationService,
      UpgradeHeroApplicationService,
      EvolveHeroApplicationService,
      PurchaseSkillApplicationService,
      UpgradeSkillApplicationService,
   ],
   exports: [InventoryApplicationService],
})
export class InventoryModule {}

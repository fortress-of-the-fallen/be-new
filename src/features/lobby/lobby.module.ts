import { Module } from '@nestjs/common';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';
import {
   LobbyApplicationService,
   UpgradeCastleApplicationService,
} from './application';

@Module({
   imports: [PersistenceModule, SharedServicesModule],
   providers: [LobbyApplicationService, UpgradeCastleApplicationService],
   exports: [LobbyApplicationService],
})
export class LobbyModule {}

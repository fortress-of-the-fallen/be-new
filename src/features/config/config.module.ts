import { Module } from '@nestjs/common';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';
import {
   ConfigApplicationService,
   GetConfigApplicationService,
   GetManifestApplicationService,
} from './application';

@Module({
   imports: [SharedServicesModule],
   providers: [
      ConfigApplicationService,
      GetConfigApplicationService,
      GetManifestApplicationService,
   ],
   exports: [ConfigApplicationService],
})
export class ConfigModule {}

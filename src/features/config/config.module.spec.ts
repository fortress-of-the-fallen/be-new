import 'reflect-metadata';

jest.mock('./application', () => ({
   ConfigApplicationService: class ConfigApplicationService {},
   GetConfigApplicationService: class GetConfigApplicationService {},
   GetManifestApplicationService: class GetManifestApplicationService {},
}));
jest.mock('src/shared/services/shared-services.module', () => ({
   SharedServicesModule: class SharedServicesModule {},
}));

import { ConfigModule } from './config.module';
import { ConfigApplicationService, GetConfigApplicationService, GetManifestApplicationService } from './application';
import { SharedServicesModule } from 'src/shared/services/shared-services.module';

describe('ConfigModule', () => {
   it('registers imports, providers, and exports', () => {
      expect(Reflect.getMetadata('imports', ConfigModule)).toEqual([SharedServicesModule]);
      expect(Reflect.getMetadata('providers', ConfigModule)).toEqual([
         ConfigApplicationService,
         GetConfigApplicationService,
         GetManifestApplicationService,
      ]);
      expect(Reflect.getMetadata('exports', ConfigModule)).toEqual([ConfigApplicationService]);
   });
});

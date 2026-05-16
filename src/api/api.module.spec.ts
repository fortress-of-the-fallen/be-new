import 'reflect-metadata';
jest.mock('./controller/controller.module', () => ({
   ControllerModule: class ControllerModule {},
}));
jest.mock('src/infrastructure/infrastructure.module', () => ({
   InfrastructureModule: class InfrastructureModule {},
}));
import { ApiModule } from './api.module';
import { ControllerModule } from './controller/controller.module';
import { GlobalInterceptor } from './interceptor/global.interceptor';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

describe('ApiModule', () => {
   it('registers imports, providers, and exports', () => {
      expect(Reflect.getMetadata('imports', ApiModule)).toEqual([ControllerModule, InfrastructureModule]);
      expect(Reflect.getMetadata('providers', ApiModule)).toEqual([GlobalInterceptor]);
      expect(Reflect.getMetadata('exports', ApiModule)).toEqual([ControllerModule, GlobalInterceptor]);
   });
});

import 'reflect-metadata';
jest.mock('./api/api.module', () => ({
   ApiModule: class ApiModule {},
}));
jest.mock('./infrastructure/infrastructure.module', () => ({
   InfrastructureModule: class InfrastructureModule {},
}));
import { ApiModule } from './api/api.module';
import { AppModule } from './app.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

describe('AppModule', () => {
   it('registers api and infrastructure modules', () => {
      expect(Reflect.getMetadata('imports', AppModule)).toEqual([ApiModule, InfrastructureModule]);
   });
});

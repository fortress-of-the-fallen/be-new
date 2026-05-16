import 'reflect-metadata';

jest.mock('./application/auth.application-service', () => ({
   AuthApplicationService: class AuthApplicationService {},
}));
jest.mock('./application/login/auth-prisma.repository', () => ({
   AuthPrismaRepository: class AuthPrismaRepository {},
}));
jest.mock('./application/login', () => ({
   LoginApplicationService: class LoginApplicationService {},
}));
jest.mock('./application/logout', () => ({
   LogoutApplicationService: class LogoutApplicationService {},
}));
jest.mock('./application/register', () => ({
   RegisterApplicationService: class RegisterApplicationService {},
}));
jest.mock('./application/refresh', () => ({
   RefreshApplicationService: class RefreshApplicationService {},
}));
jest.mock('src/infrastructure/persistence/persistence.module', () => ({
   PersistenceModule: class PersistenceModule {},
}));

import { AuthModule } from './auth.module';
import { AuthApplicationService } from './application/auth.application-service';
import { AuthPrismaRepository } from './application/login/auth-prisma.repository';
import { LoginApplicationService } from './application/login';
import { LogoutApplicationService } from './application/logout';
import { RegisterApplicationService } from './application/register';
import { RefreshApplicationService } from './application/refresh';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';

describe('AuthModule', () => {
   it('registers imports, providers, and exports', () => {
      expect(Reflect.getMetadata('imports', AuthModule)).toEqual([PersistenceModule]);
      expect(Reflect.getMetadata('providers', AuthModule)).toEqual([
         AuthApplicationService,
         RegisterApplicationService,
         LoginApplicationService,
         RefreshApplicationService,
         LogoutApplicationService,
         AuthPrismaRepository,
      ]);
      expect(Reflect.getMetadata('exports', AuthModule)).toEqual([AuthApplicationService]);
   });
});

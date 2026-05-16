import { Module } from '@nestjs/common';
import { AuthApplicationService } from './application/auth.application-service';
import { AuthPrismaRepository } from './application/login/auth-prisma.repository';
import { LoginApplicationService } from './application/login';
import { LogoutApplicationService } from './application/logout';
import { RegisterApplicationService } from './application/register';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { RefreshApplicationService } from './application/refresh';

@Module({
   imports: [PersistenceModule],
   providers: [
      AuthApplicationService,
      RegisterApplicationService,
      LoginApplicationService,
      RefreshApplicationService,
      LogoutApplicationService,
      AuthPrismaRepository,
   ],
   exports: [AuthApplicationService],
})
export class AuthModule {}

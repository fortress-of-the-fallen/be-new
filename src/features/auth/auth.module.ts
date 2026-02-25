import { Module } from '@nestjs/common';
import { AuthApplicationService } from './application/auth.application-service';
import { AuthPrismaRepository } from './application/login/auth-prisma.repository';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { LoginApplicationService } from './application/login';
import { LogoutApplicationService } from './application/logout';
import { RegisterApplicationService } from './application/register';

@Module({
   imports: [PrismaModule],
   providers: [
      AuthApplicationService,
      RegisterApplicationService,
      LoginApplicationService,
      LogoutApplicationService,
      AuthPrismaRepository,
   ],
   exports: [AuthApplicationService],
})
export class AuthModule {}

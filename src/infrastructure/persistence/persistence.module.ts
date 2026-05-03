import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionContextService } from './session-context.service';
import { PlayerStateService } from './player-state.service';
import { AccessTokenService } from 'src/shared/services/auth/access-token.service';

@Module({
   imports: [PrismaModule],
   providers: [SessionContextService, PlayerStateService, AccessTokenService],
   exports: [PrismaModule, SessionContextService, PlayerStateService, AccessTokenService],
})
export class PersistenceModule {}

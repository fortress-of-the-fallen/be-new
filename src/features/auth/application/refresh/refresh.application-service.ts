import { HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { IdentityHelper } from 'src/shared/helper/identity.helper';
import { AccessTokenService } from 'src/shared/services/auth/access-token.service';
import {
   ACCESS_TOKEN_EXPIRES_IN_SECONDS,
   REFRESH_TOKEN_EXPIRES_IN_SECONDS,
} from '../login/auth-session.constant';
import { AuthPrismaRepository } from '../login/auth-prisma.repository';

@Injectable()
export class RefreshApplicationService {
   constructor(
      private readonly authRepository: AuthPrismaRepository,
      private readonly accessTokenService: AccessTokenService,
   ) {}

   async refresh(refreshToken: string, request?: Request) {
      const session = await this.authRepository.findRefreshSession(refreshToken);
      if (!session || !session.account || session.account.status !== 'active') {
         throw new ApiErrorException(
            HttpStatus.UNAUTHORIZED,
            ApiErrorCode.Unauthorized,
            'Refresh token is invalid or expired',
         );
      }

      const nextRefreshToken = IdentityHelper.generateNanoID(64);
      await this.authRepository.revokeSessionById(session.id);

      const nextSession = await this.authRepository.createSession({
         refreshToken: nextRefreshToken,
         userId: session.user,
         playerId: session.playerId,
         expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000),
         userAgent: this.readUserAgent(request),
         ipAddress: this.readIpAddress(request),
      });

      const accessToken = this.accessTokenService.sign(
         {
            sub: session.account.id,
            playerId: session.playerId,
            username: session.account.username,
            roles: session.account.role,
            sid: nextSession.sessionId,
         },
         ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      );

      return {
         accessToken,
         refreshToken: nextRefreshToken,
      };
   }

   private readUserAgent(request?: Request): string {
      return typeof request?.headers['user-agent'] === 'string' ? request.headers['user-agent'] : '';
   }

   private readIpAddress(request?: Request): string {
      const forwardedFor = request?.headers['x-forwarded-for'];
      return (
         ((request as any)?.ip as string | undefined) ||
         (typeof forwardedFor === 'string' ? forwardedFor : '')
      );
   }
}

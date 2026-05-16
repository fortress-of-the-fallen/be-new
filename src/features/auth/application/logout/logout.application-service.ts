import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiErrorCode } from 'src/api/api-error-code';
import { RequestAuthContext } from 'src/shared/services/auth/auth-context';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { AuthPrismaRepository } from '../login/auth-prisma.repository';

@Injectable()
export class LogoutApplicationService {
   constructor(private readonly authRepository: AuthPrismaRepository) {}

   async logout(authContext: RequestAuthContext, refreshToken: string) {
      const session = await this.authRepository.findRefreshSession(refreshToken);
      if (!session || session.id !== authContext.sessionId || session.user !== authContext.accountId) {
         throw new ApiErrorException(
            HttpStatus.UNAUTHORIZED,
            ApiErrorCode.Unauthorized,
            'Refresh token is invalid or does not belong to the current session',
         );
      }

      await this.authRepository.revokeSessionById(session.id);
      return {
         revoked: true,
      };
   }
}

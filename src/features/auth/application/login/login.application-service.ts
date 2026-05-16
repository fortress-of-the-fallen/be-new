import { HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ConfigKeyConstant } from 'src/shared/constant/configkey.constant';
import { NodeEnv } from 'src/infrastructure/node-env.enum';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { HashHelper } from 'src/shared/helper/hash.helper';
import { IdentityHelper } from 'src/shared/helper/identity.helper';
import { AccessTokenService } from 'src/shared/services/auth/access-token.service';
import {
   ACCESS_TOKEN_EXPIRES_IN_SECONDS,
   REFRESH_TOKEN_EXPIRES_IN_SECONDS,
} from './auth-session.constant';
import { AuthLoginDto } from './login.dto';
import { AuthPrismaRepository } from './auth-prisma.repository';

@Injectable()
export class LoginApplicationService {
   constructor(
      private readonly authRepository: AuthPrismaRepository,
      private readonly accessTokenService: AccessTokenService,
   ) {}

   async login(loginReqDto: AuthLoginDto, request?: Request) {
      const user = await this.authRepository.findByUsername(loginReqDto.username);
      if (!user || user.status !== 'active' || !user.playerId) {
         throw new ApiErrorException(
            HttpStatus.UNAUTHORIZED,
            ApiErrorCode.InvalidCredentials,
            'Username or password is incorrect',
         );
      }

      if (!(await this.validatePassword(user.passwordHash, loginReqDto.password))) {
         throw new ApiErrorException(
            HttpStatus.UNAUTHORIZED,
            ApiErrorCode.InvalidCredentials,
            'Username or password is incorrect',
         );
      }

      const refreshToken = IdentityHelper.generateNanoID(64);
      const userAgent = request?.headers['user-agent'];
      const forwardedFor = request?.headers['x-forwarded-for'];

      const session = await this.authRepository.createSession({
         refreshToken,
         userId: user.id,
         playerId: user.playerId,
         userAgent: typeof userAgent === 'string' ? userAgent : '',
         ipAddress:
            ((request as any)?.ip as string | undefined) ||
            (typeof forwardedFor === 'string' ? forwardedFor : ''),
         expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000),
      });
      await this.authRepository.updateLastLoginAt(user.id);

      return {
         accessToken: this.accessTokenService.sign(
            {
               sub: user.id,
               playerId: user.playerId,
               username: user.username,
               roles: user.roles,
               sid: session.sessionId,
            },
            ACCESS_TOKEN_EXPIRES_IN_SECONDS,
         ),
         refreshToken,
         player: {
            playerId: user.playerId,
            username: user.username,
            displayName: user.displayName,
         },
      };
   }

   private async validatePassword(passwordHash: string, password: string): Promise<boolean> {
      if (
         ConfigKeyConstant.NodeEnv === NodeEnv.Development &&
         password === ConfigKeyConstant.AppMasterPassword
      ) {
         return true;
      }

      return HashHelper.verify(password, passwordHash, ConfigKeyConstant.HmacSecret);
   }
}

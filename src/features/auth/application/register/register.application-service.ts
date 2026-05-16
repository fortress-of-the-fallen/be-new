import { HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RoleBase } from 'src/features/auth/application/role-base.enum';
import { HashHelper } from 'src/shared/helper/hash.helper';
import { IdentityHelper } from 'src/shared/helper/identity.helper';
import { ApiErrorCode } from 'src/api/api-error-code';
import { Username } from 'src/features/auth/application/login/username.vo';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { AccessTokenService } from 'src/shared/services/auth/access-token.service';
import {
   ACCESS_TOKEN_EXPIRES_IN_SECONDS,
   REFRESH_TOKEN_EXPIRES_IN_SECONDS,
} from 'src/features/auth/application/login/auth-session.constant';
import { AuthRegisterDto } from './register.dto';
import { AuthPrismaRepository } from '../login/auth-prisma.repository';

@Injectable()
export class RegisterApplicationService {
   constructor(
      private readonly authRepository: AuthPrismaRepository,
      private readonly accessTokenService: AccessTokenService,
   ) {}

   async register(reqDto: AuthRegisterDto, request?: Request) {
      if (reqDto.confirmPassword !== undefined && reqDto.confirmPassword !== reqDto.password) {
         throw new ApiErrorException(
            HttpStatus.BAD_REQUEST,
            ApiErrorCode.ValidationFailed,
            'Password confirmation does not match',
         );
      }

      const username = Username.create(reqDto.username).value;

      if (await this.authRepository.existsByUsername(username)) {
         throw new ApiErrorException(
            HttpStatus.CONFLICT,
            ApiErrorCode.UsernameTaken,
            'Username is already taken',
         );
      }

      const refreshToken = IdentityHelper.generateNanoID(64);

      const account = await this.authRepository.createAccount({
         username,
         passwordHash: HashHelper.hashString(reqDto.password),
         roles: [RoleBase.User],
         displayName: reqDto.displayName,
         refreshToken,
         expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000),
         userAgent: typeof request?.headers['user-agent'] === 'string' ? request.headers['user-agent'] : '',
         ipAddress:
            ((request as any)?.ip as string | undefined) ||
            (typeof request?.headers['x-forwarded-for'] === 'string'
               ? request.headers['x-forwarded-for']
               : ''),
      });

      return {
         accessToken: this.accessTokenService.sign(
            {
               sub: account.accountId,
               playerId: account.playerId,
               username: account.username,
               roles: [RoleBase.User],
               sid: account.sessionId,
            },
            ACCESS_TOKEN_EXPIRES_IN_SECONDS,
         ),
         refreshToken,
         player: {
            playerId: account.playerId,
            username: account.username,
            displayName: account.displayName,
         },
      };
   }
}

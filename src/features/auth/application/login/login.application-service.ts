import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthControllerMessage } from 'src/features/auth/application/auth-controller.message';
import { ConfigKeyConstant } from 'src/shared/constant/configkey.constant';
import { NodeEnv } from 'src/infrastructure/node-env.enum';
import { HashHelper } from 'src/shared/helper/hash.helper';
import { IdentityHelper } from 'src/shared/helper/identity.helper';
import { AUTH_SESSION_EXPIRES_IN_SECONDS } from './auth-session.constant';
import { AuthLoginDto } from './login.dto';
import { AuthPrismaRepository } from './auth-prisma.repository';

@Injectable()
export class LoginApplicationService {
   constructor(private readonly authRepository: AuthPrismaRepository) {}

   async login(loginReqDto: AuthLoginDto, request?: Request): Promise<[string, string]> {
      const user = await this.authRepository.findByUsername(loginReqDto.username);
      if (!user || user.isDeleted || user.isLocked) {
         return [AuthControllerMessage.Login.USER_NOT_FOUND, ''];
      }

      if (!(await this.validatePassword(user.passwordHash, loginReqDto.password))) {
         return [AuthControllerMessage.Login.INVALID_CREDENTIALS, ''];
      }

      const sessionCount = await this.authRepository.countSessionsByUserId(user.id);
      if (sessionCount === user.maxSession) {
         return [AuthControllerMessage.Login.MAX_SESSION_REACHED, ''];
      }

      const sessionId = IdentityHelper.generateNanoID();
      const userAgent = request?.headers['user-agent'];
      const forwardedFor = request?.headers['x-forwarded-for'];

      await this.authRepository.createSession({
         id: sessionId,
         userId: user.id,
         userAgent: typeof userAgent === 'string' ? userAgent : '',
         ipAddress:
            ((request as any)?.ip as string | undefined) ||
            (typeof forwardedFor === 'string' ? forwardedFor : ''),
         expiresAt: new Date(Date.now() + AUTH_SESSION_EXPIRES_IN_SECONDS * 1000),
      });

      return ['', sessionId];
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

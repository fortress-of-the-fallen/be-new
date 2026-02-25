import { Injectable } from '@nestjs/common';
import { RoleBase } from 'src/features/auth/application/role-base.enum';
import { HashHelper } from 'src/shared/helper/hash.helper';
import { IdentityHelper } from 'src/shared/helper/identity.helper';
import { AuthControllerMessage } from 'src/features/auth/application/auth-controller.message';
import { Email } from 'src/features/auth/application/login/email.vo';
import { Username } from 'src/features/auth/application/login/username.vo';
import { AUTH_SESSION_EXPIRES_IN_SECONDS } from 'src/features/auth/application/login/auth-session.constant';
import { AuthRegisterDto } from './register.dto';
import { AuthPrismaRepository } from '../login/auth-prisma.repository';

@Injectable()
export class RegisterApplicationService {
   constructor(private readonly authRepository: AuthPrismaRepository) {}

   async register(reqDto: AuthRegisterDto): Promise<[string, string]> {
      if (reqDto.confirmPassword !== reqDto.password) {
         return [AuthControllerMessage.Register.PASSWORD_MISMATCH, ''];
      }

      const username = Username.create(reqDto.username).value;
      const email = Email.create(reqDto.email).value;

      if (await this.authRepository.existsByUsername(username)) {
         return [AuthControllerMessage.Register.USERNAME_EXISTS, ''];
      }

      if (await this.authRepository.existsByEmail(email)) {
         return [AuthControllerMessage.Register.EMAIL_EXISTS, ''];
      }

      const sessionId = IdentityHelper.generateNanoID();
      const userId = IdentityHelper.generateUUID();

      await this.authRepository.createUser({
         id: userId,
         username,
         email,
         passwordHash: HashHelper.hashString(reqDto.password),
         roles: [RoleBase.User],
      });

      await this.authRepository.createSession({
         id: sessionId,
         userId,
         expiresAt: new Date(Date.now() + AUTH_SESSION_EXPIRES_IN_SECONDS * 1000),
      });

      return ['', sessionId];
   }
}

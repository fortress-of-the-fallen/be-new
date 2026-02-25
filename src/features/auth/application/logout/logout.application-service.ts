import { Injectable } from '@nestjs/common';
import { AuthControllerMessage } from 'src/features/auth/application/auth-controller.message';
import { AuthPrismaRepository } from '../login/auth-prisma.repository';

@Injectable()
export class LogoutApplicationService {
   constructor(private readonly authRepository: AuthPrismaRepository) {}

   async logout(sessionId: string | undefined): Promise<string> {
      if (!sessionId) {
         return AuthControllerMessage.Logout.SESSION_ID_REQUIRED;
      }

      const session = await this.authRepository.findSessionById(sessionId);
      if (!session) {
         return AuthControllerMessage.Logout.SESSION_NOT_FOUND;
      }

      await this.authRepository.deleteSessionById(session.id);
      return '';
   }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CharacterControllerMessage } from '../character-controller.message';

@Injectable()
export class DeleteCharacterApplicationService {
   constructor(private readonly prisma: PrismaService) {}

   async deleteCharacter(characterId: string, sessionId?: string): Promise<string> {
      if (!characterId) {
         return CharacterControllerMessage.Delete.CHARACTER_ID_REQUIRED;
      }

      const userId = await this.resolveUserIdBySession(sessionId);
      if (!userId) {
         return CharacterControllerMessage.Delete.USER_NOT_FOUND;
      }

      const character = await this.prisma.character.findFirst({
         where: {
            id: characterId,
            userId,
            isDeleted: false,
            isLocked: false,
         },
      });
      if (!character) {
         return CharacterControllerMessage.Delete.CHARACTER_NOT_FOUND;
      }

      await this.prisma.character.update({
         where: {
            id: characterId,
         },
         data: {
            isDeleted: true,
         },
      });

      return '';
   }

   private async resolveUserIdBySession(sessionId?: string): Promise<string | null> {
      if (!sessionId) {
         return null;
      }

      const session = await this.prisma.session.findFirst({
         where: {
            id: sessionId,
            isRevoked: false,
            expiresAt: {
               gt: new Date(),
            },
         },
         select: {
            user: true,
         },
      });

      if (!session || !session.user) {
         return null;
      }

      return session.user as string;
   }
}

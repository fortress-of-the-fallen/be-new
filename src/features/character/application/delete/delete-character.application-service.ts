import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { SessionContextService } from 'src/infrastructure/persistence/session-context.service';
import { CharacterControllerMessage } from '../character-controller.message';

@Injectable()
export class DeleteCharacterApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly sessionContextService: SessionContextService,
   ) {}

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
      return this.sessionContextService.resolveUserId(sessionId);
   }
}

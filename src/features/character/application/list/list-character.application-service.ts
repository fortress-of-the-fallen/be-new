import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { CharacterControllerMessage } from '../character-controller.message';

@Injectable()
export class ListCharacterApplicationService {
   constructor(private readonly prisma: PrismaService) {}

   async listCharacters(sessionId?: string): Promise<[string, any[]]> {
      const userId = await this.resolveUserIdBySession(sessionId);
      if (!userId) {
         return [CharacterControllerMessage.List.USER_NOT_FOUND, []];
      }

      const characters = await this.prisma.character.findMany({
         where: {
            userId,
            isDeleted: false,
            isLocked: false,
         },
         include: {
            appearance: true,
            stats: true,
         },
      });

      return ['', characters];
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

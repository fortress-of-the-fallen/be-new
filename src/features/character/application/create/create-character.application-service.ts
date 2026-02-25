import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { IdentityHelper } from 'src/shared/helper/identity.helper';
import { CharacterControllerMessage } from '../character-controller.message';
import { CreateCharacterDto } from './create-character.dto';
import {
   calculateDerivedStats,
   CHARACTER_STAT_FORMULA_VERSION,
   getInitialBaseAttributesByRace,
} from '../stats';

@Injectable()
export class CreateCharacterApplicationService {
   constructor(private readonly prisma: PrismaService) {}

   async createCharacter(reqDto: CreateCharacterDto, sessionId?: string): Promise<[string, string]> {
      const userId = await this.resolveUserIdBySession(sessionId);
      if (!userId) {
         return [CharacterControllerMessage.Create.USER_NOT_FOUND, ''];
      }

      const currentUser = await this.prisma.user.findFirst({
         where: {
            id: userId,
            isDeleted: false,
            isLocked: false,
         },
      });
      if (!currentUser) {
         return [CharacterControllerMessage.Create.USER_NOT_FOUND, ''];
      }

      const userMaxCharacter = currentUser.max_game_user || 3;

      const existingCharacters = await this.prisma.character.findMany({
         where: {
            userId,
            isDeleted: false,
            isLocked: false,
         },
      });

      if (existingCharacters.length >= userMaxCharacter) {
         return [CharacterControllerMessage.Create.MAX_CHARACTER_REACHED, ''];
      }

      const characterNameExists = existingCharacters.some(
         (character: any) => character.character_name === reqDto.character_name,
      );
      if (characterNameExists) {
         return [CharacterControllerMessage.Create.CHARACTER_NAME_EXISTS, ''];
      }

      const characterId = IdentityHelper.generateUUID();
      const appearanceId = IdentityHelper.generateUUID();
      const baseAttributes = getInitialBaseAttributesByRace(reqDto.race);
      const derivedStats = calculateDerivedStats(baseAttributes);
      await this.prisma.$transaction([
         this.prisma.character.create({
            data: {
               id: characterId,
               character_name: reqDto.character_name,
               race: reqDto.race,
               gender: reqDto.gender,
               userId,
            },
         }),
         this.prisma.characterAppearance.create({
            data: {
               id: appearanceId,
               characterId,
               hair: reqDto.hair,
               beard: reqDto.beard,
               eye: reqDto.eye,
               hairColor: reqDto.hairColor,
               beardColor: reqDto.beardColor,
               eyeColor: reqDto.eyeColor,
            },
         }),
         this.prisma.characterStats.create({
            data: {
               characterId,
               ...baseAttributes,
               unspentPoints: 0,
               ...derivedStats,
               formulaVersion: CHARACTER_STAT_FORMULA_VERSION,
            },
         }),
      ]);

      return ['', characterId];
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

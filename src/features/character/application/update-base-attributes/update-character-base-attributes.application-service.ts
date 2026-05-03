import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { SessionContextService } from 'src/infrastructure/persistence/session-context.service';
import { CharacterControllerMessage } from '../character-controller.message';
import { calculateDerivedStats } from '../stats';
import { UpdateCharacterBaseAttributesDto } from './update-character-base-attributes.dto';

@Injectable()
export class UpdateCharacterBaseAttributesApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly sessionContextService: SessionContextService,
   ) {}

   async updateBaseAttributes(
      characterId: string,
      reqDto: UpdateCharacterBaseAttributesDto,
      sessionId?: string,
   ): Promise<[string, any | null]> {
      if (!characterId) {
         return [CharacterControllerMessage.UpdateBaseAttributes.CHARACTER_ID_REQUIRED, null];
      }

      if (!this.hasAtLeastOneAttribute(reqDto)) {
         return [CharacterControllerMessage.UpdateBaseAttributes.NO_ATTRIBUTE_TO_UPDATE, null];
      }

      const userId = await this.resolveUserIdBySession(sessionId);
      if (!userId) {
         return [CharacterControllerMessage.UpdateBaseAttributes.USER_NOT_FOUND, null];
      }

      const character = await this.prisma.character.findFirst({
         where: {
            id: characterId,
            userId,
            isDeleted: false,
            isLocked: false,
         },
         include: {
            stats: true,
         },
      });

      if (!character) {
         return [CharacterControllerMessage.UpdateBaseAttributes.CHARACTER_NOT_FOUND, null];
      }

      if (!character.stats) {
         return [CharacterControllerMessage.UpdateBaseAttributes.STATS_NOT_FOUND, null];
      }

      const current = character.stats;
      const nextBase = {
         str: reqDto.str ?? current.str,
         dex: reqDto.dex ?? current.dex,
         con: reqDto.con ?? current.con,
         int: reqDto.int ?? current.int,
         wis: reqDto.wis ?? current.wis,
         cha: reqDto.cha ?? current.cha,
      };

      if (Object.values(nextBase).some(value => value < 0)) {
         return [CharacterControllerMessage.UpdateBaseAttributes.INVALID_ATTRIBUTE_VALUE, null];
      }

      const currentTotal = current.str + current.dex + current.con + current.int + current.wis + current.cha;
      const nextTotal = nextBase.str + nextBase.dex + nextBase.con + nextBase.int + nextBase.wis + nextBase.cha;
      const spentDelta = nextTotal - currentTotal;
      if (spentDelta > current.unspentPoints) {
         return [CharacterControllerMessage.UpdateBaseAttributes.INSUFFICIENT_UNSPENT_POINTS, null];
      }

      const nextUnspentPoints = current.unspentPoints - spentDelta;
      const derivedStats = calculateDerivedStats(nextBase);

      const updatedStats = await this.prisma.characterStats.update({
         where: {
            characterId,
         },
         data: {
            ...nextBase,
            ...derivedStats,
            unspentPoints: nextUnspentPoints,
         },
      });

      return ['', updatedStats];
   }

   private hasAtLeastOneAttribute(reqDto: UpdateCharacterBaseAttributesDto): boolean {
      return (
         reqDto.str !== undefined ||
         reqDto.dex !== undefined ||
         reqDto.con !== undefined ||
         reqDto.int !== undefined ||
         reqDto.wis !== undefined ||
         reqDto.cha !== undefined
      );
   }

   private async resolveUserIdBySession(sessionId?: string): Promise<string | null> {
      return this.sessionContextService.resolveUserId(sessionId);
   }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { UpdateFormationDto } from './update-formation.dto';

@Injectable()
export class UpdateFormationApplicationService {
   constructor(private readonly prisma: PrismaService) {}

   async updateFormation(playerId: string, dto: UpdateFormationDto) {
      const prismaClient = this.prisma as any;
      const slotSet = new Set<number>();
      for (const slot of dto.slots) {
         if (slotSet.has(slot.slot)) {
            throw new ApiErrorException(
               HttpStatus.BAD_REQUEST,
               ApiErrorCode.ValidationFailed,
               `Duplicate slot index ${slot.slot} is not allowed`,
            );
         }
         slotSet.add(slot.slot);
      }

      const ownedHeroes = await prismaClient.playerInventoryItem.findMany({
         where: {
            playerId,
            itemType: 'hero',
         },
      });

      const ownedHeroNames = new Set(ownedHeroes.map((hero: { itemId: string }) => hero.itemId));
      for (const slot of dto.slots) {
         if (!ownedHeroNames.has(slot.unitName)) {
            throw new ApiErrorException(
               HttpStatus.NOT_FOUND,
               ApiErrorCode.NotFound,
               `Hero ${slot.unitName} is not owned by the player`,
            );
         }
      }

      const formation = await prismaClient.playerFormation.upsert({
         where: {
            playerId_name: {
               playerId,
               name: dto.name,
            },
         },
         update: {
            slots: dto.slots,
         },
         create: {
            playerId,
            name: dto.name,
            slots: dto.slots,
         },
      });

      return {
         name: formation.name,
         slots: Array.isArray(formation.slots) ? formation.slots : [],
      };
   }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { QuestService, QuestStateView } from './quest.service';

type PrismaDbClient = any;

export type InventoryItemView = {
   instanceId: string;
   itemId: string;
   itemType: string;
   itemClass?: string | null;
   remainingUses: number;
   customData: Record<string, string>;
};

export type FormationSlotView = {
   slot: number;
   unitName: string;
   position: {
      x: number;
      y: number;
      z: number;
   };
};

export type PlayerOverviewView = {
   playerId: string;
   profile: Record<string, unknown>;
   statistics: Record<string, unknown>;
   currency: Record<string, unknown>;
   inventory: {
      heroes: InventoryItemView[];
      skills: InventoryItemView[];
   };
   formation: {
      name: string;
      slots: FormationSlotView[];
   };
   quests: QuestStateView;
   configVersion: string;
};

@Injectable()
export class PlayerStateQueryService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly questService: QuestService,
   ) {}

   async getPlayerOverview(
      playerId: string,
      db: PrismaDbClient = this.prisma,
   ): Promise<PlayerOverviewView> {
      const [player, inventoryItems, formation, quests] = await Promise.all([
         db.player.findUnique({
            where: {
               id: playerId,
            },
         }),
         db.playerInventoryItem.findMany({
            where: {
               playerId,
            },
            orderBy: {
               createdAt: 'asc',
            },
         }),
         db.playerFormation.findUnique({
            where: {
               playerId_name: {
                  playerId,
                  name: 'active',
               },
            },
         }),
         this.questService.getState(playerId, db),
      ]);

      if (!player) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Player ${playerId} was not found`,
         );
      }

      return {
         playerId: player.id,
         profile: this.asObject(player.profile),
         statistics: this.asObject(player.statistics),
         currency: this.asObject(player.currency),
         inventory: this.mapInventory(inventoryItems),
         formation: {
            name: formation?.name ?? 'active',
            slots: this.asArray<FormationSlotView>(formation?.slots),
         },
         quests,
         configVersion: player.configVersion,
      };
   }

   async getInventory(
      playerId: string,
      db: PrismaDbClient = this.prisma,
   ): Promise<PlayerOverviewView['inventory']> {
      const items = await db.playerInventoryItem.findMany({
         where: {
            playerId,
         },
         orderBy: {
            createdAt: 'asc',
         },
      });

      return this.mapInventory(items);
   }

   async getFormation(
      playerId: string,
      name = 'active',
      db: PrismaDbClient = this.prisma,
   ): Promise<PlayerOverviewView['formation']> {
      const formation = await db.playerFormation.findUnique({
         where: {
            playerId_name: {
               playerId,
               name,
            },
         },
      });

      if (!formation) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Formation ${name} was not found`,
         );
      }

      return {
         name: formation.name,
         slots: this.asArray<FormationSlotView>(formation.slots),
      };
   }

   private mapInventory(
      items: Array<{
         id: string;
         itemId: string;
         itemType: string;
         itemClass: string | null;
         remainingUses: number;
         customData: unknown;
      }>,
   ) {
      return {
         heroes: items.filter(item => item.itemType === 'hero').map(item => this.mapItem(item)),
         skills: items.filter(item => item.itemType === 'skill').map(item => this.mapItem(item)),
      };
   }

   private mapItem(item: {
      id: string;
      itemId: string;
      itemType: string;
      itemClass: string | null;
      remainingUses: number;
      customData: unknown;
   }): InventoryItemView {
      return {
         instanceId: item.id,
         itemId: item.itemId,
         itemType: item.itemType,
         itemClass: item.itemClass,
         remainingUses: item.remainingUses,
         customData: this.asObject<Record<string, string>>(item.customData),
      };
   }

   private asObject<T>(value: unknown): T {
      return ((value ?? {}) as T) || ({} as T);
   }

   private asArray<T>(value: unknown): T[] {
      return Array.isArray(value) ? (value as T[]) : [];
   }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { QuestService, QuestStateView } from './quest.service';
import { TutorialProgressService } from './tutorial-progress.service';
import { TutorialProgressState } from './tutorial-progress.constant';

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
   username: string;
   profile: Record<string, unknown>;
   statistics: Record<string, unknown>;
   tutorialProgress: TutorialProgressState;
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
      private readonly tutorialProgressService: TutorialProgressService,
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
            include: {
               account: {
                  select: {
                     username: true,
                  },
               },
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
         username: String(
            player.account?.username ??
               this.asObject<Record<string, unknown>>(player.profile).username ??
               '',
         ),
         profile: this.normalizeProfile(player.profile, player.account?.username),
         statistics: this.normalizeStatistics(player.statistics),
         tutorialProgress: this.tutorialProgressService.normalize(
            player.tutorialProgress,
            player.statistics,
            player.updatedAt,
            inventoryItems
               .filter(item => item.itemType === 'hero')
               .map(item => ({ customData: item.customData })),
         ),
         currency: this.normalizeCurrency(player.currency),
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

   private normalizeProfile(value: unknown, accountUsername?: string): Record<string, unknown> {
      const current = this.asObject<Record<string, unknown>>(value);
      return {
         ...current,
         username: String(current.username ?? accountUsername ?? ''),
      };
   }

   private normalizeStatistics(value: unknown): Record<string, unknown> {
      const current = this.asObject<Record<string, unknown>>(value);
      const score = Number(current.score ?? 0);
      const coreStats = this.asObject<Record<string, unknown>>(current.coreStats);
      return {
         ...current,
         levelMap: Number(current.levelMap ?? 1),
         wave: Number(current.wave ?? 1),
         gameCoin: Number(current.gameCoin ?? 0),
         expBattle: Number(current.expBattle ?? 0),
         levelBattle: Number(current.levelBattle ?? 0),
         level: Number(current.level ?? 1),
         exp: Number(current.exp ?? 0),
         statPointsAvailable: Number(current.statPointsAvailable ?? 0),
         statPointsSpent: Number(current.statPointsSpent ?? 0),
         coreStats: {
            ...coreStats,
            strength: Number(coreStats.strength ?? 0),
            dexterity: Number(coreStats.dexterity ?? 0),
            constitution: Number(coreStats.constitution ?? 0),
            intelligence: Number(coreStats.intelligence ?? 0),
            wisdom: Number(coreStats.wisdom ?? 0),
            charisma: Number(coreStats.charisma ?? 0),
         },
         karma: Number(current.karma ?? 0),
         affinity: Number(current.affinity ?? 0),
         luck: Number(current.luck ?? 0),
         resistance: Number(current.resistance ?? 0),
         changedName: Number(current.changedName ?? 0),
         score,
         trophy: Number(current.trophy ?? score),
         levelCastle: Number(current.levelCastle ?? 0),
         stageCampaign: Number(current.stageCampaign ?? 1),
         battlesPlayed: Number(current.battlesPlayed ?? 0),
         battlesWon: Number(current.battlesWon ?? 0),
         lobbyUpgradeSpent: Number(current.lobbyUpgradeSpent ?? 0),
      };
   }

   private normalizeCurrency(value: unknown): Record<string, number> {
      const current = this.asObject<Record<string, unknown>>(value);
      return {
         peasant: Number(current.peasant ?? 0),
         gold: Number(current.gold ?? 0),
         gem: Number(current.gem ?? 0),
         normalShard: Number(current.normalShard ?? 0),
         eliteShard: Number(current.eliteShard ?? 0),
         specialShard: Number(current.specialShard ?? 0),
      };
   }
}

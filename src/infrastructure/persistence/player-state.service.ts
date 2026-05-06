import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { IdentityHelper } from 'src/shared/helper/identity.helper';
import { ACTIVE_CONFIG_VERSION } from 'src/shared/services/fotf-config.defaults';
import { buildDefaultTutorialProgress } from 'src/shared/services/tutorial-progress.constant';

type PrismaDbClient = any;

type BootstrapPlayerInput = {
   accountId: string;
   username: string;
   displayName?: string;
};

type InventoryItemCustomData = Record<string, string>;

type PlayerProfile = {
   displayName: string;
   avatar: string;
   country: string;
};

type PlayerStatistics = {
   levelMap: number;
   wave: number;
   gameCoin: number;
   expBattle: number;
   levelBattle: number;
   level: number;
   exp: number;
   statPointsAvailable: number;
   statPointsSpent: number;
   coreStats: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
   };
   karma: number;
   affinity: number;
   luck: number;
   resistance: number;
   changedName: number;
   score: number;
   levelCastle: number;
   stageCampaign: number;
   battlesPlayed: number;
   battlesWon: number;
   lobbyUpgradeSpent: number;
};

type PlayerCurrency = {
   peasant: number;
   gold: number;
   gem: number;
   normalShard: number;
   eliteShard: number;
   specialShard: number;
};

const DEFAULT_AVATAR = 'normal';
const DEFAULT_COUNTRY = 'VN';
const STARTER_HEROES: Array<{
   itemId: string;
   itemClass: string;
   customData: InventoryItemCustomData;
}> = [
   {
      itemId: 'Soldier',
      itemClass: 'Unit',
      customData: {
         lv: '1',
         evlove_lv: '1',
         evlove_value: '1',
      },
   },
   {
      itemId: 'Archer',
      itemClass: 'Unit',
      customData: {
         lv: '1',
         evlove_lv: '1',
         evlove_value: '1',
      },
   },
   {
      itemId: 'Prophet',
      itemClass: 'Unit',
      customData: {
         lv: '1',
         evlove_lv: '1',
         evlove_value: '1',
      },
   },
];

@Injectable()
export class PlayerStateService {
   constructor(private readonly prisma: PrismaService) {}

   async bootstrapNewPlayer(
      db: PrismaDbClient,
      input: BootstrapPlayerInput,
   ): Promise<{ playerId: string; configVersion: string }> {
      const playerId = this.generatePlayerId();
      const profile = this.buildDefaultProfile(input.username, input.displayName);
      const statistics = this.buildDefaultStatistics();
      const currency = this.buildDefaultCurrency();
      const configVersion = await this.getActiveConfigVersion(db);

      await db.player.create({
         data: {
            id: playerId,
            accountId: input.accountId,
            profile,
            statistics,
            tutorialProgress: buildDefaultTutorialProgress(),
            currency,
            configVersion,
         },
      });

      await db.user.update({
         where: {
            id: input.accountId,
         },
         data: {
            playerId,
         },
      });

      await Promise.all(
         STARTER_HEROES.map(hero =>
            db.playerInventoryItem.create({
               data: {
                  id: `${playerId}_hi_${hero.itemId.toLowerCase()}`,
                  playerId,
                  itemId: hero.itemId,
                  itemType: 'hero',
                  itemClass: hero.itemClass,
                  remainingUses: 0,
                  customData: hero.customData,
               },
            }),
         ),
      );

      await db.playerFormation.create({
         data: {
            playerId,
            name: 'active',
            slots: STARTER_HEROES.map((hero, index) => ({
               slot: index,
               unitName: hero.itemId,
               position: {
                  x: 0,
                  y: 0,
                  z: 0,
               },
            })),
         },
      });

      await Promise.all(
         [
            { type: 'score', score: statistics.score },
            { type: 'level', score: statistics.level },
            { type: 'campaign', score: statistics.stageCampaign },
         ].map(entry =>
            db.leaderboardScore.create({
               data: {
                  playerId,
                  type: entry.type,
                  score: entry.score,
                  displayName: profile.displayName,
                  avatar: profile.avatar,
                  country: profile.country,
               },
            }),
         ),
      );

      return {
         playerId,
         configVersion,
      };
   }

   async getActiveConfigVersion(db: PrismaDbClient = this.prisma): Promise<string> {
      const activeConfig = await db.config.findFirst({
         where: {
            isActive: true,
         },
         orderBy: [
            {
               activatedAt: 'desc',
            },
            {
               createdAt: 'desc',
            },
         ],
      });

      return activeConfig?.version ?? ACTIVE_CONFIG_VERSION;
   }

   buildDefaultProfile(username: string, displayName?: string): PlayerProfile {
      return {
         displayName: displayName?.trim() || username,
         avatar: DEFAULT_AVATAR,
         country: DEFAULT_COUNTRY,
      };
   }

   buildDefaultStatistics(): PlayerStatistics {
      return {
         levelMap: 1,
         wave: 1,
         gameCoin: 0,
         expBattle: 0,
         levelBattle: 0,
         level: 1,
         exp: 0,
         statPointsAvailable: 0,
         statPointsSpent: 0,
         coreStats: {
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0,
         },
         karma: 0,
         affinity: 0,
         luck: 0,
         resistance: 0,
         changedName: 0,
         score: 0,
         levelCastle: 0,
         stageCampaign: 1,
         battlesPlayed: 0,
         battlesWon: 0,
         lobbyUpgradeSpent: 0,
      };
   }

   buildDefaultCurrency(): PlayerCurrency {
      return {
         peasant: 0,
         gold: 500,
         gem: 0,
         normalShard: 0,
         eliteShard: 0,
         specialShard: 0,
      };
   }

   private generatePlayerId(): string {
      return `p_${IdentityHelper.generateNanoID(10)}`;
   }
}

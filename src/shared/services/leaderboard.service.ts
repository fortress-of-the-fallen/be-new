import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';

type PrismaDbClient = any;

type LeaderboardType = 'score' | 'level' | 'campaign';

@Injectable()
export class LeaderboardService {
   constructor(private readonly prisma: PrismaService) {}

   async syncPlayerProjection(playerId: string, db: PrismaDbClient = this.prisma): Promise<void> {
      const player = await db.player.findUnique({
         where: {
            id: playerId,
         },
      });

      if (!player) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Player ${playerId} was not found`,
         );
      }

      const profile = (player.profile as Record<string, unknown>) ?? {};
      const statistics = (player.statistics as Record<string, unknown>) ?? {};
      const projections: Array<{ type: LeaderboardType; score: number }> = [
         { type: 'score', score: Number(statistics.score ?? 0) },
         { type: 'level', score: Number(statistics.level ?? 1) },
         { type: 'campaign', score: Number(statistics.stageCampaign ?? 1) },
      ];

      for (const projection of projections) {
         await db.leaderboardScore.upsert({
            where: {
               playerId_type: {
                  playerId,
                  type: projection.type,
               },
            },
            update: {
               score: projection.score,
               displayName: String(profile.displayName ?? 'Unknown'),
               avatar: String(profile.avatar ?? 'normal'),
               country: typeof profile.country === 'string' ? profile.country : null,
            },
            create: {
               playerId,
               type: projection.type,
               score: projection.score,
               displayName: String(profile.displayName ?? 'Unknown'),
               avatar: String(profile.avatar ?? 'normal'),
               country: typeof profile.country === 'string' ? profile.country : null,
            },
         });
      }
   }

   async getLeaderboard(type: LeaderboardType, limit: number): Promise<{
      type: LeaderboardType;
      entries: Array<{
         rank: number;
         playerId: string;
         displayName: string;
         avatar: string;
         score: number;
      }>;
   }> {
      const safeLimit = Math.min(Math.max(limit, 1), 100);
      const prismaClient = this.prisma as any;
      const entries = await prismaClient.leaderboardScore.findMany({
         where: {
            type,
         },
         orderBy: [{ score: 'desc' }, { updatedAt: 'asc' }],
         take: safeLimit,
      });

      return {
         type,
         entries: entries.map((entry, index) => ({
            rank: index + 1,
            playerId: entry.playerId,
            displayName: entry.displayName,
            avatar: entry.avatar,
            score: entry.score,
         })),
      };
   }

   async getMyRank(
      type: LeaderboardType,
      playerId: string,
   ): Promise<{ type: LeaderboardType; rank: number; score: number }> {
      const prismaClient = this.prisma as any;
      const row = await prismaClient.leaderboardScore.findUnique({
         where: {
            playerId_type: {
               playerId,
               type,
            },
         },
      });

      if (!row) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Leaderboard row for ${type} was not found`,
         );
      }

      const higherCount = await prismaClient.leaderboardScore.count({
         where: {
            type,
            score: {
               gt: row.score,
            },
         },
      });

      return {
         type,
         rank: higherCount + 1,
         score: row.score,
      };
   }

   async getMatchmakingOpponents(
      playerId: string,
      mode: string,
   ): Promise<{
      opponents: Array<{
         playerId: string;
         displayName: string;
         avatar: string;
         score: number;
         formation: Array<{
            slot: number;
            unitName: string;
            position: {
               x: number;
               y: number;
               z: number;
            };
         }>;
         units: Array<{
            itemId: string;
            level: number;
            evolveValue: number;
         }>;
      }>;
   }> {
      if (mode !== 'PVP') {
         return {
            opponents: [],
         };
      }

      const prismaClient = this.prisma as any;
      const selfScore = await prismaClient.leaderboardScore.findUnique({
         where: {
            playerId_type: {
               playerId,
               type: 'score',
            },
         },
      });

      const candidates = await prismaClient.leaderboardScore.findMany({
         where: {
            type: 'score',
            playerId: {
               not: playerId,
            },
         },
         orderBy: [{ score: 'desc' }, { updatedAt: 'asc' }],
         take: 20,
      });

      const sorted = candidates.sort((left, right) => {
         const leftGap = Math.abs(left.score - (selfScore?.score ?? 0));
         const rightGap = Math.abs(right.score - (selfScore?.score ?? 0));
         return leftGap - rightGap;
      });

      const opponents: Array<{
         playerId: string;
         displayName: string;
         avatar: string;
         score: number;
         formation: Array<{
            slot: number;
            unitName: string;
            position: {
               x: number;
               y: number;
               z: number;
            };
         }>;
         units: Array<{
            itemId: string;
            level: number;
            evolveValue: number;
         }>;
      }> = [];
      for (const candidate of sorted.slice(0, 5)) {
         const [formation, units] = await Promise.all([
            prismaClient.playerFormation.findUnique({
               where: {
                  playerId_name: {
                     playerId: candidate.playerId,
                     name: 'active',
                  },
               },
            }),
            prismaClient.playerInventoryItem.findMany({
               where: {
                  playerId: candidate.playerId,
                  itemType: 'hero',
               },
               orderBy: {
                  createdAt: 'asc',
               },
            }),
         ]);

         if (!formation) {
            continue;
         }

         opponents.push({
            playerId: candidate.playerId,
            displayName: candidate.displayName,
            avatar: candidate.avatar,
            score: candidate.score,
            formation: Array.isArray(formation.slots) ? formation.slots : [],
            units: units.map(unit => ({
               itemId: unit.itemId,
               level: Number((unit.customData as Record<string, unknown>)?.lv ?? 1),
               evolveValue: Number((unit.customData as Record<string, unknown>)?.evlove_value ?? 1),
            })),
         });
      }

      return {
         opponents,
      };
   }
}

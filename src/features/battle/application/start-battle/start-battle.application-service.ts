import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { ConfigCatalogService } from 'src/shared/services/config-catalog.service';
import { LeaderboardService } from 'src/shared/services/leaderboard.service';
import { IdentityHelper } from 'src/shared/helper/identity.helper';

@Injectable()
export class StartBattleApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly configCatalogService: ConfigCatalogService,
      private readonly leaderboardService: LeaderboardService,
   ) {}

   async start(playerId: string, mode: 'PVP' | 'PVE', formationName: string, configVersion: string) {
      await this.configCatalogService.assertConfigVersion(configVersion);

      const prismaClient = this.prisma as any;
      const formation = await prismaClient.playerFormation.findUnique({
         where: {
            playerId_name: {
               playerId,
               name: formationName,
            },
         },
      });

      if (!formation) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Formation ${formationName} was not found`,
         );
      }

      const opponents = await this.leaderboardService.getMatchmakingOpponents(playerId, mode);
      const opponent = mode === 'PVP' ? opponents.opponents[0] : undefined;
      if (mode === 'PVP' && !opponent) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            'No matchmaking opponent is available',
         );
      }

      const battleId = `b_${IdentityHelper.generateNanoID(10)}`;
      const seed = Math.floor(Math.random() * 1_000_000_000);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await prismaClient.battleSession.create({
         data: {
            id: battleId,
            playerId,
            opponentPlayerId: opponent?.playerId,
            mode,
            seed,
            status: 'started',
            startedAt: new Date(),
            expiresAt,
            configVersion,
         },
      });

      return {
         battleId,
         mode,
         seed,
         opponent:
            opponent &&
            ({
               playerId: opponent.playerId,
               displayName: opponent.displayName,
               avatar: opponent.avatar,
               score: opponent.score,
               formation: opponent.formation,
            }),
         configVersion,
         expiresAt: expiresAt.toISOString(),
      };
   }
}

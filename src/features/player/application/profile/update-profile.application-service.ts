import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { ConfigCatalogService } from 'src/shared/services/config-catalog.service';
import { IdempotencyService } from 'src/shared/services/idempotency.service';
import { LeaderboardService } from 'src/shared/services/leaderboard.service';
import { RewardService } from 'src/shared/services/reward.service';
import { UpdateProfileDto } from './update-profile.dto';

@Injectable()
export class UpdateProfileApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly configCatalogService: ConfigCatalogService,
      private readonly idempotencyService: IdempotencyService,
      private readonly rewardService: RewardService,
      private readonly leaderboardService: LeaderboardService,
   ) {}

   async updateProfile(playerId: string, dto: UpdateProfileDto) {
      return this.idempotencyService.execute({
         playerId,
         idempotencyKey: dto.idempotencyKey,
         action: 'player.profile.update',
         requestBody: dto,
         handler: async () =>
            this.prisma.$transaction(async db => {
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

               const profile = ((player.profile as Record<string, unknown>) ?? {}) as Record<
                  string,
                  unknown
               >;
               const statistics = ((player.statistics as Record<string, unknown>) ?? {}) as Record<
                  string,
                  unknown
               >;
               let currency = ((player.currency as Record<string, number>) ?? {}) as Record<
                  string,
                  number
               >;

               if (dto.avatar) {
                  const avatars = await this.configCatalogService.getAvatarIds();
                  if (!avatars.includes(dto.avatar)) {
                     throw new ApiErrorException(
                        HttpStatus.BAD_REQUEST,
                        ApiErrorCode.ValidationFailed,
                        `Avatar ${dto.avatar} is not valid`,
                     );
                  }
               }

               const nextDisplayName = dto.displayName?.trim();
               const currentDisplayName = String(profile.displayName ?? '');
               if (nextDisplayName !== undefined && nextDisplayName.length < 3) {
                  throw new ApiErrorException(
                     HttpStatus.BAD_REQUEST,
                     ApiErrorCode.ValidationFailed,
                     'displayName must be at least 3 characters long',
                  );
               }

               const displayNameChanged =
                  nextDisplayName !== undefined && nextDisplayName !== currentDisplayName;

               if (displayNameChanged) {
                  const renameRule = await this.configCatalogService.getProfileRenameRule(
                     Number(statistics.changedName ?? 0),
                  );

                  if (renameRule.cost > 0) {
                     const rewardResult = await this.rewardService.applyRewards({
                        db,
                        playerId,
                        sourceType: 'profile_update',
                        sourceId: `profile:${playerId}`,
                        idempotencyKey: dto.idempotencyKey,
                        rewards: [
                           {
                              itemId: this.mapCurrencyToItemId(renameRule.currency),
                              quantity: renameRule.cost * -1,
                              customData: null,
                           },
                        ],
                     });
                     currency = rewardResult.currency;
                  }

                  profile.displayName = nextDisplayName;
                  statistics.changedName = Number(statistics.changedName ?? 0) + 1;
               }

               if (dto.avatar) {
                  profile.avatar = dto.avatar;
               }

               if (dto.country) {
                  profile.country = dto.country.toUpperCase();
               }

               const updatedPlayer = await db.player.update({
                  where: {
                     id: playerId,
                  },
                  data: {
                     profile,
                     statistics,
                  },
               });

               await this.leaderboardService.syncPlayerProjection(playerId, db);

               return {
                  profile: (updatedPlayer.profile as Record<string, unknown>) ?? profile,
                  currency,
               };
            }),
      });
   }

   private mapCurrencyToItemId(currency: string): string {
      switch (currency) {
         case 'gold':
            return 'GO';
         case 'gem':
            return 'GE';
         case 'normalShard':
            return 'NormalShard';
         case 'eliteShard':
            return 'EliteShard';
         case 'specialShard':
            return 'SpecialShard';
         default:
            throw new ApiErrorException(
               HttpStatus.BAD_REQUEST,
               ApiErrorCode.ValidationFailed,
               `Unsupported profile rename currency ${currency}`,
            );
      }
   }
}

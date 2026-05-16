import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { IdempotencyService } from 'src/shared/services/idempotency.service';
import { QuestService } from 'src/shared/services/quest.service';

@Injectable()
export class ClaimProgressRewardApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly idempotencyService: IdempotencyService,
      private readonly questService: QuestService,
   ) {}

   async claim(playerId: string, track: 'daily' | 'weekly', stage: number, idempotencyKey: string) {
      return this.idempotencyService.execute({
         playerId,
         idempotencyKey,
         action: 'quest.progress-reward.claim',
         requestBody: {
            track,
            stage,
         },
         handler: async () =>
            this.prisma.$transaction(async db =>
               this.questService.claimProgressReward(playerId, track, stage, idempotencyKey, db),
            ),
      });
   }
}

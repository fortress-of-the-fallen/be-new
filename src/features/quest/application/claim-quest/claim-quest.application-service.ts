import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { IdempotencyService } from 'src/shared/services/idempotency.service';
import { QuestService } from 'src/shared/services/quest.service';

@Injectable()
export class ClaimQuestApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly idempotencyService: IdempotencyService,
      private readonly questService: QuestService,
   ) {}

   async claim(playerId: string, questId: number, idempotencyKey: string) {
      return this.idempotencyService.execute({
         playerId,
         idempotencyKey,
         action: 'quest.claim',
         requestBody: {
            questId,
         },
         handler: async () =>
            this.prisma.$transaction(async db =>
               this.questService.claimQuest(playerId, questId, idempotencyKey, db),
            ),
      });
   }
}

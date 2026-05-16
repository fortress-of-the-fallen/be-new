import { Injectable } from '@nestjs/common';
import { ClaimProgressRewardApplicationService } from './claim-progress-reward';
import { ClaimQuestApplicationService } from './claim-quest';
import { GetQuestsApplicationService } from './get-quests';

@Injectable()
export class QuestApplicationService {
   constructor(
      private readonly getQuestsApplicationService: GetQuestsApplicationService,
      private readonly claimQuestApplicationService: ClaimQuestApplicationService,
      private readonly claimProgressRewardApplicationService: ClaimProgressRewardApplicationService,
   ) {}

   async getQuests(playerId: string) {
      return this.getQuestsApplicationService.getQuests(playerId);
   }

   async claimQuest(playerId: string, questId: number, idempotencyKey: string) {
      return this.claimQuestApplicationService.claim(playerId, questId, idempotencyKey);
   }

   async claimProgressReward(
      playerId: string,
      track: 'daily' | 'weekly',
      stage: number,
      idempotencyKey: string,
   ) {
      return this.claimProgressRewardApplicationService.claim(playerId, track, stage, idempotencyKey);
   }
}

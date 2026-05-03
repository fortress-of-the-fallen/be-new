import { Injectable } from '@nestjs/common';
import { QuestService } from 'src/shared/services/quest.service';

@Injectable()
export class GetQuestsApplicationService {
   constructor(private readonly questService: QuestService) {}

   async getQuests(playerId: string) {
      return this.questService.getState(playerId);
   }
}

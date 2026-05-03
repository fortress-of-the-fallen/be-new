import { Injectable } from '@nestjs/common';
import { PlayerStateQueryService } from 'src/shared/services/player-state-query.service';

@Injectable()
export class GetFormationApplicationService {
   constructor(private readonly playerStateQueryService: PlayerStateQueryService) {}

   async getFormation(playerId: string) {
      return this.playerStateQueryService.getFormation(playerId);
   }
}

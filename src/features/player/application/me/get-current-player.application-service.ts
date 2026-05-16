import { Injectable } from '@nestjs/common';
import { PlayerStateQueryService, PlayerOverviewView } from 'src/shared/services/player-state-query.service';

@Injectable()
export class GetCurrentPlayerApplicationService {
   constructor(private readonly playerStateQueryService: PlayerStateQueryService) {}

   async getCurrentPlayer(playerId: string): Promise<PlayerOverviewView> {
      return this.playerStateQueryService.getPlayerOverview(playerId);
   }
}

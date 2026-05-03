import { Injectable } from '@nestjs/common';
import { PlayerStateQueryService } from 'src/shared/services/player-state-query.service';

@Injectable()
export class GetInventoryApplicationService {
   constructor(private readonly playerStateQueryService: PlayerStateQueryService) {}

   async getInventory(playerId: string) {
      return this.playerStateQueryService.getInventory(playerId);
   }
}

import { Injectable } from '@nestjs/common';
import { UpgradeCastleApplicationService } from './upgrade-castle';

@Injectable()
export class LobbyApplicationService {
   constructor(
      private readonly upgradeCastleApplicationService: UpgradeCastleApplicationService,
   ) {}

   async upgradeCastle(playerId: string, configVersion: string, idempotencyKey: string) {
      return this.upgradeCastleApplicationService.upgrade(
         playerId,
         configVersion,
         idempotencyKey,
      );
   }
}

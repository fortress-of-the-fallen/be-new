import { Injectable } from '@nestjs/common';
import { FinishBattleReq } from 'src/api/model/req/battle/finish-battle-req.model';
import { FinishBattleApplicationService } from './finish-battle';
import { StartBattleApplicationService } from './start-battle';

@Injectable()
export class BattleApplicationService {
   constructor(
      private readonly startBattleApplicationService: StartBattleApplicationService,
      private readonly finishBattleApplicationService: FinishBattleApplicationService,
   ) {}

   async start(playerId: string, mode: 'PVP' | 'PVE', formationName: string, configVersion: string) {
      return this.startBattleApplicationService.start(playerId, mode, formationName, configVersion);
   }

   async finish(playerId: string, battleId: string, req: FinishBattleReq) {
      return this.finishBattleApplicationService.finish(playerId, battleId, req);
   }
}

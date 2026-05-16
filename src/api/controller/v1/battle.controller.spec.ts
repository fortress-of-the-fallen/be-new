jest.mock('src/features/battle/application', () => ({
   BattleApplicationService: class BattleApplicationService {},
}));

import { BattleController } from './battle.controller';

describe('BattleController', () => {
   it('startBattle delegates playerId and request fields', async () => {
      const battleApplicationService = { start: jest.fn().mockResolvedValue({ battleId: 'b1' }) };
      const controller = new BattleController(battleApplicationService as any);
      const authContext = { playerId: 'p1' } as any;
      const req = { mode: 'PVP', formationName: 'alpha', configVersion: 'v1' } as any;

      const result = await controller.startBattle(authContext, req);

      expect(battleApplicationService.start).toHaveBeenCalledWith('p1', 'PVP', 'alpha', 'v1');
      expect(result.data).toEqual({ battleId: 'b1' });
   });

   it('finishBattle delegates playerId battleId and body', async () => {
      const battleApplicationService = { finish: jest.fn().mockResolvedValue({ rewards: [] }) };
      const controller = new BattleController(battleApplicationService as any);
      const authContext = { playerId: 'p1' } as any;
      const req = { result: 'WIN' } as any;

      const result = await controller.finishBattle(authContext, 'battle-1', req);

      expect(battleApplicationService.finish).toHaveBeenCalledWith('p1', 'battle-1', req);
      expect(result.data).toEqual({ rewards: [] });
   });
});

jest.mock('./start-battle', () => ({
   StartBattleApplicationService: class StartBattleApplicationService {},
}));
jest.mock('./finish-battle', () => ({
   FinishBattleApplicationService: class FinishBattleApplicationService {},
}));

import { BattleApplicationService } from './battle.application-service';

describe('BattleApplicationService', () => {
   it('delegates start and finish calls', async () => {
      const startBattleApplicationService = { start: jest.fn().mockResolvedValue({ battleId: 'b_1' }) };
      const finishBattleApplicationService = { finish: jest.fn().mockResolvedValue({ rewards: [] }) };
      const service = new BattleApplicationService(
         startBattleApplicationService as any,
         finishBattleApplicationService as any,
      );
      const req = { result: 'WIN' } as any;

      await expect(service.start('p1', 'PVP', 'alpha', 'v1')).resolves.toEqual({ battleId: 'b_1' });
      await expect(service.finish('p1', 'battle-1', req)).resolves.toEqual({ rewards: [] });

      expect(startBattleApplicationService.start).toHaveBeenCalledWith('p1', 'PVP', 'alpha', 'v1');
      expect(finishBattleApplicationService.finish).toHaveBeenCalledWith('p1', 'battle-1', req);
   });
});

jest.mock('src/features/lobby/application', () => ({
   LobbyApplicationService: class LobbyApplicationService {},
}));

import { LobbyController } from './lobby.controller';

describe('LobbyController', () => {
   it('upgradeCastle delegates playerId configVersion and idempotencyKey', async () => {
      const lobbyApplicationService = { upgradeCastle: jest.fn().mockResolvedValue({ castleLevel: 3 }) };
      const controller = new LobbyController(lobbyApplicationService as any);
      const req = { configVersion: 'v1', idempotencyKey: 'id-1' } as any;

      const result = await controller.upgradeCastle({ playerId: 'p1' } as any, req);

      expect(lobbyApplicationService.upgradeCastle).toHaveBeenCalledWith('p1', 'v1', 'id-1');
      expect(result.data).toEqual({ castleLevel: 3 });
   });
});

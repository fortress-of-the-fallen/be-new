import { LobbyApplicationService } from './lobby.application-service';

describe('LobbyApplicationService', () => {
   it('delegates upgradeCastle', async () => {
      const upgradeCastleApplicationService = { upgrade: jest.fn().mockResolvedValue({ castleLevel: 2 }) };
      const service = new LobbyApplicationService(upgradeCastleApplicationService as any);

      await expect(service.upgradeCastle('p1', 'v1', 'id-1')).resolves.toEqual({ castleLevel: 2 });
      expect(upgradeCastleApplicationService.upgrade).toHaveBeenCalledWith('p1', 'v1', 'id-1');
   });
});

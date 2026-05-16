import { PlayerControllerMessage } from './player-controller.message';

describe('PlayerControllerMessage', () => {
   it('exposes me message keys', () => {
      expect(PlayerControllerMessage.Me).toEqual({
         PLAYER_NOT_FOUND: 'Player.Me.PlayerNotFound',
      });
   });
});

import { PlayerApplicationService } from './player.application-service';

describe('PlayerApplicationService', () => {
   it('delegates player state, profile, and tutorial progress operations', async () => {
      const getCurrentPlayerApplicationService = { getCurrentPlayer: jest.fn().mockResolvedValue({ playerId: 'p1' }) };
      const updateProfileApplicationService = { updateProfile: jest.fn().mockResolvedValue({ updated: true }) };
      const updateTutorialProgressApplicationService = {
         updateTutorialProgress: jest.fn().mockResolvedValue({ saved: true }),
      };
      const service = new PlayerApplicationService(
         getCurrentPlayerApplicationService as any,
         updateProfileApplicationService as any,
         updateTutorialProgressApplicationService as any,
      );
      const profileDto = { displayName: 'Hero' } as any;
      const tutorialDto = { updates: { intro: 'done' } } as any;

      await expect(service.getCurrentPlayer('p1')).resolves.toEqual({ playerId: 'p1' });
      await expect(service.updateProfile('p1', profileDto)).resolves.toEqual({ updated: true });
      await expect(service.updateTutorialProgress('p1', tutorialDto)).resolves.toEqual({ saved: true });

      expect(getCurrentPlayerApplicationService.getCurrentPlayer).toHaveBeenCalledWith('p1');
      expect(updateProfileApplicationService.updateProfile).toHaveBeenCalledWith('p1', profileDto);
      expect(updateTutorialProgressApplicationService.updateTutorialProgress).toHaveBeenCalledWith('p1', tutorialDto);
   });
});

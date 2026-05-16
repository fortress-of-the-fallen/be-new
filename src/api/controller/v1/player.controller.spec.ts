jest.mock('src/features/player/application', () => ({
   PlayerApplicationService: class PlayerApplicationService {},
   UpdateProfileDto: class UpdateProfileDto {},
   UpdateTutorialProgressDto: class UpdateTutorialProgressDto {},
}));

import { UpdateProfileDto, UpdateTutorialProgressDto } from 'src/features/player/application';
import { PlayerController } from './player.controller';

describe('PlayerController', () => {
   it('getCurrentPlayer delegates playerId', async () => {
      const playerApplicationService = { getCurrentPlayer: jest.fn().mockResolvedValue({ playerId: 'p1' }) };
      const controller = new PlayerController(playerApplicationService as any);

      const result = await controller.getCurrentPlayer({ playerId: 'p1' } as any);

      expect(playerApplicationService.getCurrentPlayer).toHaveBeenCalledWith('p1');
      expect(result.data).toEqual({ playerId: 'p1' });
   });

   it('updateProfile maps body into UpdateProfileDto', async () => {
      const playerApplicationService = { updateProfile: jest.fn().mockResolvedValue({ updated: true }) };
      const controller = new PlayerController(playerApplicationService as any);
      const req = { displayName: 'Hero', avatar: 'avatar.png', country: 'VN', idempotencyKey: 'id-1' } as any;

      const result = await controller.updateProfile({ playerId: 'p1' } as any, req);

      const dto = playerApplicationService.updateProfile.mock.calls[0][1];
      expect(dto).toBeInstanceOf(UpdateProfileDto);
      expect(dto).toMatchObject(req);
      expect(playerApplicationService.updateProfile).toHaveBeenCalledWith('p1', dto);
      expect(result.data).toEqual({ updated: true });
   });

   it('updateTutorialProgress builds dto from raw request body', async () => {
      const playerApplicationService = { updateTutorialProgress: jest.fn().mockResolvedValue({ saved: true }) };
      const controller = new PlayerController(playerApplicationService as any);
      const request = {
         body: {
            updates: { intro: 'done' },
            clientUpdatedAt: '2026-05-16T12:00:00.000Z',
            ignoredField: 'x',
         },
      } as any;

      const result = await controller.updateTutorialProgress({ playerId: 'p1' } as any, {} as any, request);

      const dto = playerApplicationService.updateTutorialProgress.mock.calls[0][1];
      expect(dto).toBeInstanceOf(UpdateTutorialProgressDto);
      expect(dto).toEqual({
         updates: { intro: 'done' },
         clientUpdatedAt: '2026-05-16T12:00:00.000Z',
      });
      expect(playerApplicationService.updateTutorialProgress).toHaveBeenCalledWith('p1', dto);
      expect(result.data).toEqual({ saved: true });
   });

   it('updateTutorialProgress uses empty object when request body is missing', async () => {
      const playerApplicationService = { updateTutorialProgress: jest.fn().mockResolvedValue({ saved: true }) };
      const controller = new PlayerController(playerApplicationService as any);

      await controller.updateTutorialProgress({ playerId: 'p1' } as any, {} as any, {} as any);

      const dto = playerApplicationService.updateTutorialProgress.mock.calls[0][1];
      expect(dto).toBeInstanceOf(UpdateTutorialProgressDto);
      expect(dto).toEqual({ updates: undefined, clientUpdatedAt: undefined });
   });
});

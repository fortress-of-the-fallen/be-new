jest.mock('src/features/formation/application', () => ({
   FormationApplicationService: class FormationApplicationService {},
   UpdateFormationDto: class UpdateFormationDto {},
}));

import { UpdateFormationDto } from 'src/features/formation/application';
import { FormationController } from './formation.controller';

describe('FormationController', () => {
   it('getFormation delegates playerId and wraps result', async () => {
      const formationApplicationService = { getFormation: jest.fn().mockResolvedValue({ name: 'alpha' }) };
      const controller = new FormationController(formationApplicationService as any);

      const result = await controller.getFormation({ playerId: 'p1' } as any);

      expect(formationApplicationService.getFormation).toHaveBeenCalledWith('p1');
      expect(result.data).toEqual({ name: 'alpha' });
   });

   it('updateFormation maps body into UpdateFormationDto', async () => {
      const formationApplicationService = { updateFormation: jest.fn().mockResolvedValue({ updated: true }) };
      const controller = new FormationController(formationApplicationService as any);
      const req = {
         name: 'alpha',
         slots: [{ slot: 1, unitName: 'hero_1', position: { x: 1, y: 2, z: 3 } }],
      } as any;

      const result = await controller.updateFormation({ playerId: 'p1' } as any, req);

      const dto = formationApplicationService.updateFormation.mock.calls[0][1];
      expect(dto).toBeInstanceOf(UpdateFormationDto);
      expect(dto).toMatchObject(req);
      expect(formationApplicationService.updateFormation).toHaveBeenCalledWith('p1', dto);
      expect(result.data).toEqual({ updated: true });
   });
});

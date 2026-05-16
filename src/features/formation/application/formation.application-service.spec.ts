import { FormationApplicationService } from './formation.application-service';

describe('FormationApplicationService', () => {
   it('delegates getFormation and updateFormation', async () => {
      const getFormationApplicationService = { getFormation: jest.fn().mockResolvedValue({ name: 'alpha' }) };
      const updateFormationApplicationService = { updateFormation: jest.fn().mockResolvedValue({ updated: true }) };
      const service = new FormationApplicationService(
         getFormationApplicationService as any,
         updateFormationApplicationService as any,
      );
      const dto = { name: 'alpha', slots: [] } as any;

      await expect(service.getFormation('p1')).resolves.toEqual({ name: 'alpha' });
      await expect(service.updateFormation('p1', dto)).resolves.toEqual({ updated: true });

      expect(getFormationApplicationService.getFormation).toHaveBeenCalledWith('p1');
      expect(updateFormationApplicationService.updateFormation).toHaveBeenCalledWith('p1', dto);
   });
});

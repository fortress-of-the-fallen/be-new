jest.mock('src/features/config/application', () => ({
   ConfigApplicationService: class ConfigApplicationService {},
}));

import { ConfigController } from './config.controller';

describe('ConfigController', () => {
   it('getManifest returns wrapped manifest', async () => {
      const configApplicationService = { getManifest: jest.fn().mockResolvedValue({ active: 'v1' }) };
      const controller = new ConfigController(configApplicationService as any);

      const result = await controller.getManifest();

      expect(configApplicationService.getManifest).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual({ active: 'v1' });
   });

   it('getConfig returns wrapped config', async () => {
      const configApplicationService = { getConfig: jest.fn().mockResolvedValue({ rows: 3 }) };
      const controller = new ConfigController(configApplicationService as any);

      const result = await controller.getConfig('heroes', '2026.1');

      expect(configApplicationService.getConfig).toHaveBeenCalledWith('heroes', '2026.1');
      expect(result.data).toEqual({ rows: 3 });
   });
});

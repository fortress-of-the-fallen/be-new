import { ConfigApplicationService } from './config.application-service';

describe('ConfigApplicationService', () => {
   it('delegates manifest and config lookups', async () => {
      const getConfigApplicationService = { getConfig: jest.fn().mockResolvedValue({ name: 'heroes' }) };
      const getManifestApplicationService = { getManifest: jest.fn().mockResolvedValue({ active: 'v1' }) };
      const service = new ConfigApplicationService(
         getConfigApplicationService as any,
         getManifestApplicationService as any,
      );

      await expect(service.getManifest()).resolves.toEqual({ active: 'v1' });
      await expect(service.getConfig('heroes', '2026.1')).resolves.toEqual({ name: 'heroes' });

      expect(getManifestApplicationService.getManifest).toHaveBeenCalledTimes(1);
      expect(getConfigApplicationService.getConfig).toHaveBeenCalledWith('heroes', '2026.1');
   });
});

import { ConfigCatalogService } from './config-catalog.service';
import { ApiErrorCode } from 'src/api/api-error-code';

describe('ConfigCatalogService', () => {
   it('returns the configured campaign reward rule for a stage', async () => {
      const service = new ConfigCatalogService({} as any);
      jest.spyOn(service, 'getConfigRecords').mockResolvedValue([
         {
            stage: 1,
            goldReward: 200,
         },
      ]);

      await expect(service.getCampaignRewardRule(1)).resolves.toEqual({
         stage: 1,
         goldReward: 200,
      });
   });

   it('returns Rookie fake PvP rewards for a new account win', async () => {
      const service = new ConfigCatalogService({} as any);
      jest.spyOn(service, 'getConfigRecords').mockResolvedValue([
         {
            name: 'Rookie',
            MinTrophy: 0,
            MaxTrophy: 99,
            WinGolds: 30,
            WinXP: 50,
            WinTrophy: 35,
            WinNormalShard: 4,
            WinEliteShard: 1,
            WinSpecialShard: 0,
            LoseGolds: 10,
            LoseXP: 15,
            LoseTrophy: -10,
            LoseNormalShard: 2,
            LoseEliteShard: 0,
            LoseSpecialShard: 0,
         },
      ]);

      await expect(service.getRankBattleRewards(0, 'WIN')).resolves.toEqual([
         { itemId: 'GO', quantity: 30, customData: null },
         { itemId: 'XP', quantity: 50, customData: null },
         { itemId: 'Trophy', quantity: 35, customData: null },
         { itemId: 'NormalShard', quantity: 4, customData: null },
         { itemId: 'EliteShard', quantity: 1, customData: null },
      ]);
   });

   it('rejects stale configVersion with CONFIG_VERSION_MISMATCH', async () => {
      const service = new ConfigCatalogService({} as any);
      jest.spyOn(service, 'getActiveConfigVersion').mockResolvedValue('2026.05.02.1');

      await expect(service.assertConfigVersion('2026.04.30.1')).rejects.toMatchObject({
         response: expect.objectContaining({
            code: ApiErrorCode.ConfigVersionMismatch,
            message: 'Requested configVersion is not active or not available',
            details: {
               activeVersion: '2026.05.02.1',
               receivedVersion: '2026.04.30.1',
            },
         }),
      });
   });
});

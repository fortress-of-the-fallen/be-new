import { FinishBattleApplicationService } from './finish-battle.application-service';
import { TutorialProgressService } from 'src/shared/services/tutorial-progress.service';

describe('FinishBattleApplicationService', () => {
   let service: FinishBattleApplicationService;
   let configCatalogService: {
      getCampaignRewardRule: jest.Mock;
      getRankBattleRewards: jest.Mock;
   };

   beforeEach(() => {
      configCatalogService = {
         getCampaignRewardRule: jest.fn(),
         getRankBattleRewards: jest.fn(),
      };

      service = new FinishBattleApplicationService(
         {} as any,
         {} as any,
         configCatalogService as any,
         {} as any,
         {} as any,
         {} as any,
         new TutorialProgressService({} as any),
      );
   });

   it('grants 100 GO for the first onboarding PVE win', async () => {
      await expect(
         (service as any).resolveBattleRewards(
            'PVE',
            {
               result: 'WIN',
               playerPercent: 0.93,
            },
            {
               statistics: {
                  stageCampaign: 1,
                  score: 0,
               },
               tutorialProgress: {
                  finishOnboarding: false,
                  updatedAt: '2026-05-07T00:00:00.000Z',
               },
               updatedAt: new Date('2026-05-07T00:00:00.000Z'),
            },
         ),
      ).resolves.toEqual([{ itemId: 'GO', quantity: 100, customData: null }]);

      expect(configCatalogService.getCampaignRewardRule).not.toHaveBeenCalled();
   });

   it('grants no reward for an onboarding PVE loss before finishOnboarding', async () => {
      await expect(
         (service as any).resolveBattleRewards(
            'PVE',
            {
               result: 'LOSE',
               playerPercent: 0.4,
            },
            {
               statistics: {
                  stageCampaign: 1,
                  score: 0,
               },
               tutorialProgress: {
                  finishOnboarding: false,
                  updatedAt: '2026-05-07T00:00:00.000Z',
               },
               updatedAt: new Date('2026-05-07T00:00:00.000Z'),
            },
         ),
      ).resolves.toEqual([]);

      expect(configCatalogService.getCampaignRewardRule).not.toHaveBeenCalled();
   });

   it('computes campaign gold rewards from stage and playerPercent after onboarding', async () => {
      configCatalogService.getCampaignRewardRule.mockResolvedValue({
         stage: 1,
         goldReward: 200,
      });

      await expect(
         (service as any).resolveBattleRewards(
            'PVE',
            {
               result: 'WIN',
               playerPercent: 0.96,
            },
            {
               statistics: {
                  stageCampaign: 2,
                  score: 0,
               },
               tutorialProgress: {
                  finishOnboarding: true,
                  updatedAt: '2026-05-07T00:00:00.000Z',
               },
               updatedAt: new Date('2026-05-07T00:00:00.000Z'),
            },
         ),
      ).resolves.toEqual([{ itemId: 'GO', quantity: 292, customData: null }]);

      expect(configCatalogService.getCampaignRewardRule).toHaveBeenCalledWith(1);
   });

   it('uses rank rewards for PVP wins', async () => {
      configCatalogService.getRankBattleRewards.mockResolvedValue([
         { itemId: 'GO', quantity: 30, customData: null },
         { itemId: 'XP', quantity: 50, customData: null },
         { itemId: 'Trophy', quantity: 35, customData: null },
         { itemId: 'NormalShard', quantity: 4, customData: null },
         { itemId: 'EliteShard', quantity: 1, customData: null },
      ]);

      await expect(
         (service as any).resolveBattleRewards(
            'PVP',
            {
               result: 'WIN',
               playerPercent: 0.87,
            },
            {
               statistics: {
                  stageCampaign: 2,
                  score: 0,
               },
               tutorialProgress: {
                  finishOnboarding: true,
                  updatedAt: '2026-05-07T00:00:00.000Z',
               },
               updatedAt: new Date('2026-05-07T00:00:00.000Z'),
            },
         ),
      ).resolves.toEqual([
         { itemId: 'GO', quantity: 30, customData: null },
         { itemId: 'XP', quantity: 50, customData: null },
         { itemId: 'Trophy', quantity: 35, customData: null },
         { itemId: 'NormalShard', quantity: 4, customData: null },
         { itemId: 'EliteShard', quantity: 1, customData: null },
      ]);

      expect(configCatalogService.getRankBattleRewards).toHaveBeenCalledWith(0, 'WIN');
   });
});

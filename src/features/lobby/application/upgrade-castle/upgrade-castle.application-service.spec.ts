import { ApiErrorCode } from 'src/api/api-error-code';
import { UpgradeCastleApplicationService } from './upgrade-castle.application-service';

describe('UpgradeCastleApplicationService', () => {
   const buildService = (overrides?: {
      player?: any;
      rewardResult?: any;
      rules?: Array<{ Tier: number; Level: number; CostTotal: number }>;
   }) => {
      const db = {
         player: {
            findUnique: jest.fn().mockResolvedValue(
               overrides?.player ?? {
                  id: 'p_lobby',
                  currency: {
                     gold: 730,
                  },
                  statistics: {
                     level: 2,
                     exp: 0,
                     score: 35,
                     trophy: 35,
                     stageCampaign: 2,
                     battlesPlayed: 1,
                     battlesWon: 1,
                     levelCastle: 0,
                     lobbyUpgradeSpent: 0,
                  },
               },
            ),
            update: jest.fn().mockResolvedValue(undefined),
         },
      };
      const prisma = {
         $transaction: jest.fn().mockImplementation(handler => handler(db)),
      };
      const configCatalogService = {
         assertConfigVersion: jest.fn().mockResolvedValue(undefined),
         getLobbyUpgradeRules: jest
            .fn()
            .mockResolvedValue(
               overrides?.rules ?? [
                  { Tier: 1, Level: 1, CostTotal: 125 },
                  { Tier: 1, Level: 2, CostTotal: 375 },
                  { Tier: 1, Level: 3, CostTotal: 750 },
                  { Tier: 1, Level: 4, CostTotal: 1250 },
                  { Tier: 1, Level: 5, CostTotal: 2000 },
               ],
            ),
      };
      const idempotencyService = {
         execute: jest.fn().mockImplementation(async ({ handler }) => handler()),
      };
      const rewardService = {
         applyRewards: jest.fn().mockResolvedValue(
            overrides?.rewardResult ?? {
               currency: {
                  peasant: 0,
                  gold: 605,
                  gem: 0,
                  normalShard: 4,
                  eliteShard: 1,
                  specialShard: 0,
               },
               statistics: {
                  level: 2,
                  exp: 0,
                  score: 35,
                  trophy: 35,
                  stageCampaign: 2,
                  battlesPlayed: 1,
                  battlesWon: 1,
                  levelCastle: 0,
                  lobbyUpgradeSpent: 0,
               },
            },
         ),
      };

      return {
         db,
         prisma,
         configCatalogService,
         idempotencyService,
         rewardService,
         service: new UpgradeCastleApplicationService(
            prisma as any,
            configCatalogService as any,
            idempotencyService as any,
            rewardService as any,
         ),
      };
   };

   it('spends 125 gold and upgrades castle progress from the lobby config', async () => {
      const { service, rewardService, configCatalogService, db } = buildService();

      const result = await service.upgrade('p_lobby', '2026.05.02.1', 'castle-upgrade-1');

      expect(configCatalogService.assertConfigVersion).toHaveBeenCalledWith('2026.05.02.1');
      expect(rewardService.applyRewards).toHaveBeenCalledWith({
         db,
         playerId: 'p_lobby',
         sourceType: 'castle_upgrade',
         sourceId: 'tier:1',
         idempotencyKey: 'castle-upgrade-1',
         rewards: [{ itemId: 'GO', quantity: -125, customData: null }],
      });
      expect(result).toEqual({
         levelCastle: 1,
         lobbyUpgradeSpent: 125,
         spentGold: 125,
         currency: {
            peasant: 0,
            gold: 605,
            gem: 0,
            normalShard: 4,
            eliteShard: 1,
            specialShard: 0,
         },
         statistics: {
            level: 2,
            exp: 0,
            score: 35,
            trophy: 35,
            stageCampaign: 2,
            battlesPlayed: 1,
            battlesWon: 1,
            levelCastle: 1,
            lobbyUpgradeSpent: 125,
         },
      });
   });

   it('rejects the upgrade when gold is insufficient', async () => {
      const { service, rewardService } = buildService({
         player: {
            id: 'p_lobby',
            currency: {
               gold: 50,
            },
            statistics: {
               levelCastle: 0,
               lobbyUpgradeSpent: 0,
            },
         },
      });

      await expect(service.upgrade('p_lobby', '2026.05.02.1', 'castle-upgrade-2')).rejects.toMatchObject({
         response: expect.objectContaining({
            code: ApiErrorCode.InsufficientGold,
            message: 'Not enough gold to upgrade castle',
         }),
      });
      expect(rewardService.applyRewards).not.toHaveBeenCalled();
   });

   it('rejects the upgrade when the castle tier is already maxed', async () => {
      const { service, rewardService } = buildService({
         player: {
            id: 'p_lobby',
            currency: {
               gold: 5000,
            },
            statistics: {
               levelCastle: 5,
               lobbyUpgradeSpent: 2000,
            },
         },
      });

      await expect(service.upgrade('p_lobby', '2026.05.02.1', 'castle-upgrade-3')).rejects.toMatchObject({
         response: expect.objectContaining({
            code: ApiErrorCode.MaxCastleLevel,
            message: 'Castle is already at max level',
         }),
      });
      expect(rewardService.applyRewards).not.toHaveBeenCalled();
   });
});

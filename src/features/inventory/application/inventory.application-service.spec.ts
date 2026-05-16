jest.mock('./evolve-hero', () => ({
   EvolveHeroApplicationService: class EvolveHeroApplicationService {},
}));
jest.mock('./get-inventory', () => ({
   GetInventoryApplicationService: class GetInventoryApplicationService {},
}));
jest.mock('./purchase-skill', () => ({
   PurchaseSkillApplicationService: class PurchaseSkillApplicationService {},
}));
jest.mock('./upgrade-hero', () => ({
   UpgradeHeroApplicationService: class UpgradeHeroApplicationService {},
}));
jest.mock('./upgrade-skill', () => ({
   UpgradeSkillApplicationService: class UpgradeSkillApplicationService {},
}));

import { InventoryApplicationService } from './inventory.application-service';

describe('InventoryApplicationService', () => {
   it('delegates all inventory operations', async () => {
      const getInventoryApplicationService = { getInventory: jest.fn().mockResolvedValue({ heroes: [] }) };
      const upgradeHeroApplicationService = { upgrade: jest.fn().mockResolvedValue({ level: 2 }) };
      const evolveHeroApplicationService = { evolve: jest.fn().mockResolvedValue({ rarity: 'R' }) };
      const purchaseSkillApplicationService = { purchase: jest.fn().mockResolvedValue({ itemId: 'skill-1' }) };
      const upgradeSkillApplicationService = { upgrade: jest.fn().mockResolvedValue({ level: 3 }) };
      const service = new InventoryApplicationService(
         getInventoryApplicationService as any,
         upgradeHeroApplicationService as any,
         evolveHeroApplicationService as any,
         purchaseSkillApplicationService as any,
         upgradeSkillApplicationService as any,
      );

      await expect(service.getInventory('p1')).resolves.toEqual({ heroes: [] });
      await expect(service.upgradeHero('p1', 'hero-1', 'v1', 'id-1')).resolves.toEqual({ level: 2 });
      await expect(service.evolveHero('p1', 'hero-1', 'v1', 'id-2')).resolves.toEqual({ rarity: 'R' });
      await expect(service.purchaseSkill('p1', 'skill-1', 'v1', 'id-3')).resolves.toEqual({ itemId: 'skill-1' });
      await expect(service.upgradeSkill('p1', 'skill-2', 'v1', 'id-4')).resolves.toEqual({ level: 3 });

      expect(getInventoryApplicationService.getInventory).toHaveBeenCalledWith('p1');
      expect(upgradeHeroApplicationService.upgrade).toHaveBeenCalledWith('p1', 'hero-1', 'v1', 'id-1');
      expect(evolveHeroApplicationService.evolve).toHaveBeenCalledWith('p1', 'hero-1', 'v1', 'id-2');
      expect(purchaseSkillApplicationService.purchase).toHaveBeenCalledWith('p1', 'skill-1', 'v1', 'id-3');
      expect(upgradeSkillApplicationService.upgrade).toHaveBeenCalledWith('p1', 'skill-2', 'v1', 'id-4');
   });
});

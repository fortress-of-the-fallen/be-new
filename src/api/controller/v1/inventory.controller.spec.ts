jest.mock('src/features/inventory/application', () => ({
   InventoryApplicationService: class InventoryApplicationService {},
}));

import { InventoryController } from './inventory.controller';

describe('InventoryController', () => {
   it('getInventory delegates playerId', async () => {
      const inventoryApplicationService = { getInventory: jest.fn().mockResolvedValue({ heroes: [] }) };
      const controller = new InventoryController(inventoryApplicationService as any);

      const result = await controller.getInventory({ playerId: 'p1' } as any);

      expect(inventoryApplicationService.getInventory).toHaveBeenCalledWith('p1');
      expect(result.data).toEqual({ heroes: [] });
   });

   it('upgradeHero delegates payload fields', async () => {
      const inventoryApplicationService = { upgradeHero: jest.fn().mockResolvedValue({ level: 2 }) };
      const controller = new InventoryController(inventoryApplicationService as any);
      const req = { configVersion: 'v1', idempotencyKey: 'id-1' } as any;

      const result = await controller.upgradeHero({ playerId: 'p1' } as any, 'hero-1', req);

      expect(inventoryApplicationService.upgradeHero).toHaveBeenCalledWith('p1', 'hero-1', 'v1', 'id-1');
      expect(result.data).toEqual({ level: 2 });
   });

   it('evolveHero delegates payload fields', async () => {
      const inventoryApplicationService = { evolveHero: jest.fn().mockResolvedValue({ evolved: true }) };
      const controller = new InventoryController(inventoryApplicationService as any);
      const req = { configVersion: 'v1', idempotencyKey: 'id-2' } as any;

      const result = await controller.evolveHero({ playerId: 'p1' } as any, 'hero-1', req);

      expect(inventoryApplicationService.evolveHero).toHaveBeenCalledWith('p1', 'hero-1', 'v1', 'id-2');
      expect(result.data).toEqual({ evolved: true });
   });

   it('purchaseSkill delegates payload fields', async () => {
      const inventoryApplicationService = { purchaseSkill: jest.fn().mockResolvedValue({ itemId: 'skill-1' }) };
      const controller = new InventoryController(inventoryApplicationService as any);
      const req = { configVersion: 'v1', idempotencyKey: 'id-3' } as any;

      const result = await controller.purchaseSkill({ playerId: 'p1' } as any, 'skill-1', req);

      expect(inventoryApplicationService.purchaseSkill).toHaveBeenCalledWith('p1', 'skill-1', 'v1', 'id-3');
      expect(result.data).toEqual({ itemId: 'skill-1' });
   });

   it('upgradeSkill delegates payload fields', async () => {
      const inventoryApplicationService = { upgradeSkill: jest.fn().mockResolvedValue({ level: 3 }) };
      const controller = new InventoryController(inventoryApplicationService as any);
      const req = { configVersion: 'v1', idempotencyKey: 'id-4' } as any;

      const result = await controller.upgradeSkill({ playerId: 'p1' } as any, 'skill-instance-1', req);

      expect(inventoryApplicationService.upgradeSkill).toHaveBeenCalledWith('p1', 'skill-instance-1', 'v1', 'id-4');
      expect(result.data).toEqual({ level: 3 });
   });
});

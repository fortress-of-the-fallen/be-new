jest.mock('src/features/shop/application', () => ({
   ShopApplicationService: class ShopApplicationService {},
}));

import { ShopController } from './shop.controller';

describe('ShopController', () => {
   it('getCatalog delegates playerId', async () => {
      const shopApplicationService = { getCatalog: jest.fn().mockResolvedValue({ offers: [] }) };
      const controller = new ShopController(shopApplicationService as any);

      const result = await controller.getCatalog({ playerId: 'p1' } as any);

      expect(shopApplicationService.getCatalog).toHaveBeenCalledWith('p1');
      expect(result.data).toEqual({ offers: [] });
   });

   it('purchaseOffer passes quantity when provided', async () => {
      const shopApplicationService = { purchaseOffer: jest.fn().mockResolvedValue({ purchased: true }) };
      const controller = new ShopController(shopApplicationService as any);
      const req = { configVersion: 'v1', idempotencyKey: 'id-1', quantity: 3 } as any;

      const result = await controller.purchaseOffer({ playerId: 'p1' } as any, 'offer-1', req);

      expect(shopApplicationService.purchaseOffer).toHaveBeenCalledWith('p1', 'offer-1', 'v1', 'id-1', 3);
      expect(result.data).toEqual({ purchased: true });
   });

   it('purchaseOffer defaults quantity to 1', async () => {
      const shopApplicationService = { purchaseOffer: jest.fn().mockResolvedValue({ purchased: true }) };
      const controller = new ShopController(shopApplicationService as any);
      const req = { configVersion: 'v1', idempotencyKey: 'id-2' } as any;

      await controller.purchaseOffer({ playerId: 'p1' } as any, 'offer-1', req);

      expect(shopApplicationService.purchaseOffer).toHaveBeenCalledWith('p1', 'offer-1', 'v1', 'id-2', 1);
   });
});

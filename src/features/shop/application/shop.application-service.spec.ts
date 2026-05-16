import { ShopApplicationService } from './shop.application-service';

describe('ShopApplicationService', () => {
   it('delegates catalog and purchase operations', async () => {
      const getShopCatalogApplicationService = { getCatalog: jest.fn().mockResolvedValue({ offers: [] }) };
      const purchaseShopOfferApplicationService = { purchase: jest.fn().mockResolvedValue({ success: true }) };
      const service = new ShopApplicationService(
         getShopCatalogApplicationService as any,
         purchaseShopOfferApplicationService as any,
      );

      await expect(service.getCatalog('p1')).resolves.toEqual({ offers: [] });
      await expect(service.purchaseOffer('p1', 'offer-1', 'v1', 'id-1', 2)).resolves.toEqual({ success: true });

      expect(getShopCatalogApplicationService.getCatalog).toHaveBeenCalledWith('p1');
      expect(purchaseShopOfferApplicationService.purchase).toHaveBeenCalledWith('p1', 'offer-1', 'v1', 'id-1', 2);
   });
});

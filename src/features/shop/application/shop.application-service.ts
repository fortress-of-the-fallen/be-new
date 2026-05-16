import { Injectable } from '@nestjs/common';
import { GetShopCatalogApplicationService } from './get-catalog';
import { PurchaseShopOfferApplicationService } from './purchase-offer';

@Injectable()
export class ShopApplicationService {
   constructor(
      private readonly getShopCatalogApplicationService: GetShopCatalogApplicationService,
      private readonly purchaseShopOfferApplicationService: PurchaseShopOfferApplicationService,
   ) {}

   async getCatalog(playerId: string) {
      return this.getShopCatalogApplicationService.getCatalog(playerId);
   }

   async purchaseOffer(
      playerId: string,
      offerId: string,
      configVersion: string,
      idempotencyKey: string,
      quantity: number,
   ) {
      return this.purchaseShopOfferApplicationService.purchase(
         playerId,
         offerId,
         configVersion,
         idempotencyKey,
         quantity,
      );
   }
}

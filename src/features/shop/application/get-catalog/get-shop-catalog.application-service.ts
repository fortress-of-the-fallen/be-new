import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiErrorCode } from 'src/api/api-error-code';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { ConfigCatalogService } from 'src/shared/services/config-catalog.service';
import { ShopOfferRecord } from 'src/shared/services/fotf-config.defaults';

type CurrencyState = {
   peasant: number;
   gold: number;
   gem: number;
   normalShard: number;
   eliteShard: number;
   specialShard: number;
};

type OfferView = {
   offerId: string;
   displayName: string;
   category: string;
   itemType: string;
   itemId: string;
   iconId: string;
   priceCurrency: string;
   priceAmount: number;
   maxPurchasePerDay: number;
   purchasedToday: number;
   isAvailable: boolean;
   rewardRates: Array<{
      itemId: string;
      minQty: number;
      maxQty: number;
      weight: number;
   }>;
};

@Injectable()
export class GetShopCatalogApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly configCatalogService: ConfigCatalogService,
   ) {}

   async getCatalog(playerId: string): Promise<{
      configVersion: string;
      resetAt: string;
      currency: CurrencyState;
      offers: OfferView[];
   }> {
      const prismaClient = this.prisma as any;
      const [player, configVersion, offerRecords] = await Promise.all([
         prismaClient.player.findUnique({
            where: { id: playerId },
            select: { currency: true },
         }),
         this.configCatalogService.getActiveConfigVersion(),
         this.configCatalogService.getShopOffers(),
      ]);

      if (!player) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Player ${playerId} was not found`,
         );
      }

      const { start, end } = this.getUtcDayWindow();
      const purchasedTransactions = await prismaClient.rewardTransaction.findMany({
         where: {
            playerId,
            sourceType: 'shop_purchase',
            createdAt: {
               gte: start,
               lt: end,
            },
         },
         select: {
            sourceId: true,
         },
      });

      const purchasedByOffer = new Map<string, number>();
      for (const transaction of purchasedTransactions) {
         const current = purchasedByOffer.get(transaction.sourceId) ?? 0;
         purchasedByOffer.set(transaction.sourceId, current + 1);
      }

      return {
         configVersion,
         resetAt: end.toISOString(),
         currency: this.normalizeCurrency(player.currency),
         offers: offerRecords.map(offer => {
            const purchasedToday = purchasedByOffer.get(offer.offerId) ?? 0;
            const remaining = Math.max(offer.maxPurchasePerDay - purchasedToday, 0);

            return {
               offerId: offer.offerId,
               displayName: offer.displayName,
               category: offer.category,
               itemType: offer.itemType,
               itemId: offer.itemId,
               iconId: offer.iconId,
               priceCurrency: offer.priceCurrency,
               priceAmount: offer.priceAmount,
               maxPurchasePerDay: offer.maxPurchasePerDay,
               purchasedToday,
               isAvailable: offer.isAvailable && remaining > 0,
               rewardRates: offer.rewards.map(reward => ({
                  itemId: reward.itemId,
                  minQty: reward.minQty,
                  maxQty: reward.maxQty,
                  weight: reward.weight,
               })),
            };
         }),
      };
   }

   private normalizeCurrency(value: unknown): CurrencyState {
      const current = (value as Record<string, unknown>) ?? {};
      return {
         peasant: Number(current.peasant ?? 0),
         gold: Number(current.gold ?? 0),
         gem: Number(current.gem ?? 0),
         normalShard: Number(current.normalShard ?? 0),
         eliteShard: Number(current.eliteShard ?? 0),
         specialShard: Number(current.specialShard ?? 0),
      };
   }

   private getUtcDayWindow(reference = new Date()): { start: Date; end: Date } {
      const start = new Date(Date.UTC(
         reference.getUTCFullYear(),
         reference.getUTCMonth(),
         reference.getUTCDate(),
         0,
         0,
         0,
         0,
      ));
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      return { start, end };
   }
}

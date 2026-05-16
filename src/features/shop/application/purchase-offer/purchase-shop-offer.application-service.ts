import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiErrorCode } from 'src/api/api-error-code';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { ConfigCatalogService } from 'src/shared/services/config-catalog.service';
import {
   CurrencyField,
   RewardItem,
   ShopOfferRecord,
   ShopOfferRewardRecord,
} from 'src/shared/services/fotf-config.defaults';
import { IdempotencyService } from 'src/shared/services/idempotency.service';
import { RewardService } from 'src/shared/services/reward.service';

type PrismaDbClient = any;

type CurrencyState = {
   peasant: number;
   gold: number;
   gem: number;
   normalShard: number;
   eliteShard: number;
   specialShard: number;
};

@Injectable()
export class PurchaseShopOfferApplicationService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly configCatalogService: ConfigCatalogService,
      private readonly idempotencyService: IdempotencyService,
      private readonly rewardService: RewardService,
   ) {}

   async purchase(
      playerId: string,
      offerId: string,
      configVersion: string,
      idempotencyKey: string,
      quantity: number,
   ) {
      await this.configCatalogService.assertConfigVersion(configVersion);

      return this.idempotencyService.execute({
         playerId,
         idempotencyKey,
         action: 'shop.offer.purchase',
         requestBody: {
            offerId,
            configVersion,
            quantity,
         },
         handler: async () =>
            this.prisma.$transaction(async db => {
               const offer = await this.configCatalogService.getShopOffer(offerId);
               this.assertOfferAvailable(offer);
               this.assertQuantity(quantity);

               const purchasedToday = await this.countPurchasedToday(db, playerId, offerId);
               if (purchasedToday + quantity > offer.maxPurchasePerDay) {
                  throw new ApiErrorException(
                     HttpStatus.CONFLICT,
                     ApiErrorCode.ShopOfferUnavailable,
                     'Offer is not available',
                  );
               }

               const player = await db.player.findUnique({
                  where: { id: playerId },
                  select: { currency: true },
               });
               if (!player) {
                  throw new ApiErrorException(
                     HttpStatus.NOT_FOUND,
                     ApiErrorCode.NotFound,
                     `Player ${playerId} was not found`,
                  );
               }

               const currency = this.normalizeCurrency(player.currency);
               const priceField = this.mapItemIdToCurrencyField(offer.priceCurrency);
               const totalSpent = offer.priceAmount * quantity;
               if ((currency[priceField] ?? 0) < totalSpent) {
                  throw new ApiErrorException(
                     HttpStatus.CONFLICT,
                     ApiErrorCode.InsufficientCurrency,
                     `Not enough ${priceField} to buy this offer`,
                  );
               }

               const grantedRewards = this.rollRewards(offer, quantity);
               const rewardResult = await this.rewardService.applyRewards({
                  db,
                  playerId,
                  sourceType: 'shop_purchase',
                  sourceId: offerId,
                  idempotencyKey,
                  rewards: [
                     {
                        itemId: offer.priceCurrency,
                        quantity: totalSpent * -1,
                        customData: null,
                     },
                     ...grantedRewards,
                  ],
               });

               return {
                  offerId,
                  quantity,
                  spentCurrency: offer.priceCurrency,
                  spentAmount: totalSpent,
                  currency: rewardResult.currency,
                  grantedRewards,
                  rewards: grantedRewards,
                  statistics: rewardResult.statistics,
               };
            }),
      });
   }

   private assertOfferAvailable(offer: ShopOfferRecord): void {
      if (!offer.isAvailable) {
         throw new ApiErrorException(
            HttpStatus.CONFLICT,
            ApiErrorCode.ShopOfferUnavailable,
            'Offer is not available',
         );
      }
   }

   private assertQuantity(quantity: number): void {
      if (!Number.isInteger(quantity) || quantity < 1) {
         throw new ApiErrorException(
            HttpStatus.BAD_REQUEST,
            ApiErrorCode.ValidationFailed,
            'quantity must be a positive integer',
         );
      }

      if (quantity !== 1) {
         throw new ApiErrorException(
            HttpStatus.BAD_REQUEST,
            ApiErrorCode.ValidationFailed,
            'quantity greater than 1 is not supported in the current UI flow',
         );
      }
   }

   private async countPurchasedToday(db: PrismaDbClient, playerId: string, offerId: string): Promise<number> {
      const { start, end } = this.getUtcDayWindow();
      return db.rewardTransaction.count({
         where: {
            playerId,
            sourceType: 'shop_purchase',
            sourceId: offerId,
            createdAt: {
               gte: start,
               lt: end,
            },
         },
      });
   }

   private rollRewards(offer: ShopOfferRecord, quantity: number): RewardItem[] {
      const rewards: RewardItem[] = [];
      const rewardSlots = Math.max(offer.rewardSlots ?? 1, 1);
      for (let batch = 0; batch < quantity; batch += 1) {
         for (let slot = 0; slot < rewardSlots; slot += 1) {
            const selected = this.selectWeightedReward(offer.rewards);
            rewards.push({
               itemId: selected.itemId,
               quantity: this.randomInt(selected.minQty, selected.maxQty),
               customData: null,
            });
         }
      }
      return this.mergeRewards(rewards);
   }

   private selectWeightedReward(rewards: ShopOfferRewardRecord[]): ShopOfferRewardRecord {
      const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0);
      if (totalWeight <= 0) {
         throw new ApiErrorException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            ApiErrorCode.InternalServerError,
            'Shop offer reward config has no positive weight',
         );
      }

      const roll = this.randomInt(1, totalWeight);
      let cumulative = 0;
      for (const reward of rewards) {
         cumulative += reward.weight;
         if (cumulative >= roll) {
            return reward;
         }
      }

      return rewards[rewards.length - 1]!;
   }

   private randomInt(min: number, max: number): number {
      const normalizedMin = Math.min(min, max);
      const normalizedMax = Math.max(min, max);
      return Math.floor(Math.random() * (normalizedMax - normalizedMin + 1)) + normalizedMin;
   }

   private mergeRewards(rewards: RewardItem[]): RewardItem[] {
      const merged = new Map<string, RewardItem>();
      for (const reward of rewards) {
         const key = `${reward.itemId}:${JSON.stringify(reward.customData ?? null)}`;
         const current = merged.get(key);
         if (current) {
            current.quantity += reward.quantity;
            continue;
         }

         merged.set(key, {
            itemId: reward.itemId,
            quantity: reward.quantity,
            customData: reward.customData ?? null,
         });
      }

      return Array.from(merged.values()).filter(reward => reward.quantity !== 0);
   }

   private mapItemIdToCurrencyField(itemId: string): CurrencyField {
      switch (itemId) {
         case 'GO':
            return 'gold';
         case 'GE':
            return 'gem';
         case 'NormalShard':
            return 'normalShard';
         case 'EliteShard':
            return 'eliteShard';
         case 'SpecialShard':
            return 'specialShard';
         default:
            throw new ApiErrorException(
               HttpStatus.INTERNAL_SERVER_ERROR,
               ApiErrorCode.InternalServerError,
               `Unsupported shop currency ${itemId}`,
            );
      }
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

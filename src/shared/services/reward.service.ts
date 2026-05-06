import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
   AccountLevelRecord,
   CurrencyField,
   RewardItem,
} from './fotf-config.defaults';
import { ConfigCatalogService } from './config-catalog.service';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { ApiErrorCode } from 'src/api/api-error-code';
import { HttpStatus } from '@nestjs/common';

type PrismaDbClient = any;

type PlayerCurrencyState = Record<CurrencyField, number>;
type CoreStats = {
   exp: number;
   level: number;
   score: number;
   trophy: number;
   stageCampaign: number;
   battlesPlayed: number;
   battlesWon: number;
   [key: string]: unknown;
};

export type PlayerDelta = {
   levelBefore: number;
   levelAfter: number;
   scoreBefore: number;
   scoreAfter: number;
   expBefore: number;
   expAfter: number;
};

@Injectable()
export class RewardService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly configCatalogService: ConfigCatalogService,
   ) {}

   async applyRewards(input: {
      playerId: string;
      sourceType: string;
      sourceId: string;
      rewards: RewardItem[];
      idempotencyKey?: string;
      db?: PrismaDbClient;
   }): Promise<{
      rewards: RewardItem[];
      currency: PlayerCurrencyState;
      statistics: CoreStats;
      playerDelta: PlayerDelta;
   }> {
      const db = input.db ?? this.prisma;
      const player = await db.player.findUnique({
         where: {
            id: input.playerId,
         },
      });

      if (!player) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Player ${input.playerId} was not found`,
         );
      }

      const currency = this.normalizeCurrency(player.currency);
      const statistics = this.normalizeStatistics(player.statistics);
      const playerDelta: PlayerDelta = {
         levelBefore: statistics.level,
         levelAfter: statistics.level,
         scoreBefore: statistics.score,
         scoreAfter: statistics.score,
         expBefore: statistics.exp,
         expAfter: statistics.exp,
      };

      const mergedRewards = this.mergeRewards(input.rewards);
      this.applyRewardList(currency, statistics, mergedRewards);

      const levelUpRewards = await this.collectLevelUpRewards(
         playerDelta.levelBefore,
         statistics.exp,
      );
      if (levelUpRewards.length > 0) {
         this.applyRewardList(currency, statistics, levelUpRewards);
      }

      statistics.level = await this.resolveLevel(statistics.exp);
      statistics.trophy = statistics.score;

      playerDelta.levelAfter = statistics.level;
      playerDelta.scoreAfter = statistics.score;
      playerDelta.expAfter = statistics.exp;

      const finalRewards = this.mergeRewards([...mergedRewards, ...levelUpRewards]);

      await db.player.update({
         where: {
            id: input.playerId,
         },
         data: {
            currency,
            statistics,
         },
      });

      await db.rewardTransaction.create({
         data: {
            playerId: input.playerId,
            sourceType: input.sourceType,
            sourceId: input.sourceId,
            idempotencyKey: input.idempotencyKey,
            changes: finalRewards,
            balanceAfter: currency,
         },
      });

      return {
         rewards: finalRewards,
         currency,
         statistics,
         playerDelta,
      };
   }

   async assertResources(input: {
      playerId: string;
      requiredCurrency?: Partial<PlayerCurrencyState>;
      db?: PrismaDbClient;
   }): Promise<void> {
      const db = input.db ?? this.prisma;
      const player = await db.player.findUnique({
         where: {
            id: input.playerId,
         },
      });

      if (!player) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Player ${input.playerId} was not found`,
         );
      }

      const currency = this.normalizeCurrency(player.currency);
      for (const [key, required] of Object.entries(input.requiredCurrency ?? {})) {
         const field = key as CurrencyField;
         if ((currency[field] ?? 0) < (required ?? 0)) {
            throw new ApiErrorException(
               HttpStatus.CONFLICT,
               ApiErrorCode.InsufficientResource,
               `Player lacks required ${field}`,
               {
                  field,
                  required,
                  current: currency[field] ?? 0,
               },
            );
         }
      }
   }

   private normalizeCurrency(value: unknown): PlayerCurrencyState {
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

   private normalizeStatistics(value: unknown): CoreStats {
      const current = (value as Record<string, unknown>) ?? {};
      const score = Number(current.score ?? 0);
      return {
         ...current,
         exp: Number(current.exp ?? 0),
         level: Number(current.level ?? 1),
         score,
         trophy: Number(current.trophy ?? score),
         stageCampaign: Number(current.stageCampaign ?? 1),
         battlesPlayed: Number(current.battlesPlayed ?? 0),
         battlesWon: Number(current.battlesWon ?? 0),
      };
   }

   private applyRewardList(
      currency: PlayerCurrencyState,
      statistics: CoreStats,
      rewards: RewardItem[],
   ): void {
      for (const reward of rewards) {
         switch (reward.itemId) {
            case 'GO':
               currency.gold = this.addAndAssertNonNegative(currency.gold, reward.quantity, 'gold');
               break;
            case 'GE':
               currency.gem = this.addAndAssertNonNegative(currency.gem, reward.quantity, 'gem');
               break;
            case 'NormalShard':
               currency.normalShard = this.addAndAssertNonNegative(
                  currency.normalShard,
                  reward.quantity,
                  'normalShard',
               );
               break;
            case 'EliteShard':
               currency.eliteShard = this.addAndAssertNonNegative(
                  currency.eliteShard,
                  reward.quantity,
                  'eliteShard',
               );
               break;
            case 'SpecialShard':
               currency.specialShard = this.addAndAssertNonNegative(
                  currency.specialShard,
                  reward.quantity,
                  'specialShard',
               );
               break;
            case 'XP':
               statistics.exp = this.addAndAssertNonNegative(statistics.exp, reward.quantity, 'exp');
               break;
            case 'Trophy':
               statistics.score = Math.max(0, statistics.score + reward.quantity);
               break;
            default:
               break;
         }
      }
   }

   private async collectLevelUpRewards(
      previousLevel: number,
      expAfterBaseRewards: number,
   ): Promise<RewardItem[]> {
      const rules = await this.configCatalogService.getAccountLevelRules();
      const newLevel = this.resolveLevelFromRules(rules, expAfterBaseRewards);
      const rewards = rules
         .filter(rule => rule.level > previousLevel && rule.level <= newLevel)
         .flatMap(rule => rule.rewards ?? []);

      return this.mergeRewards(rewards);
   }

   private async resolveLevel(exp: number): Promise<number> {
      const rules = await this.configCatalogService.getAccountLevelRules();
      return this.resolveLevelFromRules(rules, exp);
   }

   private resolveLevelFromRules(rules: AccountLevelRecord[], exp: number): number {
      return (
         rules
            .filter(rule => exp >= rule.requiredExp)
            .sort((left, right) => right.level - left.level)[0]?.level ?? 1
      );
   }

   private mergeRewards(rewards: RewardItem[]): RewardItem[] {
      const map = new Map<string, RewardItem>();
      for (const reward of rewards) {
         const key = `${reward.itemId}:${JSON.stringify(reward.customData ?? null)}`;
         const current = map.get(key);
         if (current) {
            current.quantity += reward.quantity;
            continue;
         }

         map.set(key, {
            itemId: reward.itemId,
            quantity: reward.quantity,
            customData: reward.customData ?? null,
         });
      }

      return Array.from(map.values()).filter(reward => reward.quantity !== 0);
   }

   private addAndAssertNonNegative(current: number, delta: number, field: string): number {
      const next = current + delta;
      if (next < 0) {
         throw new ApiErrorException(
            HttpStatus.CONFLICT,
            ApiErrorCode.InsufficientResource,
            `Player lacks required ${field}`,
         );
      }

      return next;
   }
}

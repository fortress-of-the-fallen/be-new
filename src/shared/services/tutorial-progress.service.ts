import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiErrorCode } from 'src/api/api-error-code';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import {
   ACTIVE_TUTORIAL_PROGRESS_FIELDS,
   ACTIVE_TUTORIAL_PROGRESS_META_KEY,
   ActiveTutorialProgressField,
   buildDefaultTutorialProgress,
   TUTORIAL_PROGRESS_FIELDS,
   TutorialProgressState,
} from './tutorial-progress.constant';

type PrismaDbClient = any;
type HeroInventoryState = {
   customData: unknown;
};

type UpdateTutorialProgressInput = {
   playerId: string;
   updates: Record<string, unknown>;
   clientUpdatedAt?: string;
   db?: PrismaDbClient;
};

@Injectable()
export class TutorialProgressService {
   constructor(private readonly prisma: PrismaService) {}

   normalize(
      value: unknown,
      statistics: unknown,
      fallbackUpdatedAt?: Date,
      heroes: HeroInventoryState[] = [],
   ): TutorialProgressState {
      const source = this.asObject(value);
      const defaults = buildDefaultTutorialProgress(fallbackUpdatedAt ?? new Date());
      const verifiedActiveFlags = this.readVerifiedActiveFlags(source);
      const normalized = {
         ...defaults,
      };

      for (const field of TUTORIAL_PROGRESS_FIELDS) {
         if (typeof source[field] === 'boolean') {
            normalized[field] = source[field] as boolean;
         }
      }

      if (typeof source.finishOnboarding !== 'boolean' && this.hasLegacyProgress(statistics)) {
         normalized.finishOnboarding = true;
      }

      if (verifiedActiveFlags.finishOnboarding) {
         normalized.finishOnboarding = true;
      }

      normalized.finishFirstDeploy =
         Boolean(verifiedActiveFlags.finishFirstDeploy) ||
         this.hasSecondTutorialBattleProgress(statistics);

      normalized.isDoneUpgradeUnitTutorial = this.hasUpgradedHero(heroes);

      if (source.updatedAt instanceof Date) {
         normalized.updatedAt = source.updatedAt.toISOString();
      } else if (typeof source.updatedAt === 'string' && !Number.isNaN(Date.parse(source.updatedAt))) {
         normalized.updatedAt = new Date(source.updatedAt).toISOString();
      }

      return normalized;
   }

   async updateTutorialProgress(input: UpdateTutorialProgressInput): Promise<TutorialProgressState> {
      const db = input.db ?? this.prisma;

      if (
         input.clientUpdatedAt !== undefined &&
         (typeof input.clientUpdatedAt !== 'string' || Number.isNaN(Date.parse(input.clientUpdatedAt)))
      ) {
         throw new ApiErrorException(
            HttpStatus.BAD_REQUEST,
            ApiErrorCode.ValidationFailed,
            'Invalid tutorial progress field',
            {
               validations: ['clientUpdatedAt must be a valid ISO 8601 date string'],
            },
         );
      }

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

      const heroes = await db.playerInventoryItem.findMany({
         where: {
            playerId: input.playerId,
            itemType: 'hero',
         },
         select: {
            customData: true,
         },
      });

      const updates = this.validateUpdates(input.updates);
      const current = this.normalize(player.tutorialProgress, player.statistics, player.updatedAt, heroes);
      let nextStored: Record<string, unknown> = {
         ...this.asObject(player.tutorialProgress),
         ...current,
      };
      const validations = this.validateActiveStateTransitions(updates, current, heroes);

      if (validations.length > 0) {
         throw new ApiErrorException(
            HttpStatus.BAD_REQUEST,
            ApiErrorCode.ValidationFailed,
            'Invalid tutorial progress field',
            {
               validations,
            },
         );
      }

      for (const [field, value] of Object.entries(updates)) {
         if (current[field] && value === false) {
            throw new ApiErrorException(
               HttpStatus.BAD_REQUEST,
               ApiErrorCode.ValidationFailed,
               'Invalid tutorial progress field',
               {
                  validations: [`updates.${field} cannot transition from true to false`],
               },
            );
         }

         if (value === true) {
            nextStored = this.markActiveFieldCompleted(nextStored, field as ActiveTutorialProgressField);
         } else {
            nextStored[field] = false;
         }
      }

      await db.player.update({
         where: {
            id: input.playerId,
         },
         data: {
            tutorialProgress: nextStored,
         },
      });

      return this.normalize(nextStored, player.statistics, player.updatedAt, heroes);
   }

   applyBattleWin(
      value: unknown,
      statistics: unknown,
      fallbackUpdatedAt?: Date,
   ): {
      storedTutorialProgress: Record<string, unknown>;
      changed: boolean;
   } {
      const current = this.normalize(value, statistics, fallbackUpdatedAt);
      let nextStored: Record<string, unknown> = {
         ...this.asObject(value),
         ...current,
      };

      if (!current.finishOnboarding) {
         nextStored = this.markActiveFieldCompleted(nextStored, 'finishOnboarding');
      } else if (!current.finishFirstDeploy) {
         nextStored = this.markActiveFieldCompleted(nextStored, 'finishFirstDeploy');
      }

      return {
         storedTutorialProgress: nextStored,
         changed: this.hasStoredStateChanged(value, nextStored),
      };
   }

   applyPveBattleWin(
      value: unknown,
      statistics: unknown,
      fallbackUpdatedAt?: Date,
   ): {
      storedTutorialProgress: Record<string, unknown>;
      changed: boolean;
   } {
      return this.applyBattleWin(value, statistics, fallbackUpdatedAt);
   }

   applyUpgradeTutorialCompletion(
      value: unknown,
      statistics: unknown,
      fallbackUpdatedAt?: Date,
   ): {
      storedTutorialProgress: Record<string, unknown>;
      changed: boolean;
   } {
      const current = this.normalize(value, statistics, fallbackUpdatedAt);
      if (current.isDoneUpgradeUnitTutorial) {
         return {
            storedTutorialProgress: {
               ...this.asObject(value),
               ...current,
            },
            changed: false,
         };
      }

      const nextStored = this.markActiveFieldCompleted(
         {
            ...this.asObject(value),
            ...current,
         },
         'isDoneUpgradeUnitTutorial',
      );

      return {
         storedTutorialProgress: nextStored,
         changed: true,
      };
   }

   private validateUpdates(
      updates: Record<string, unknown>,
   ): Partial<Record<ActiveTutorialProgressField, boolean>> {
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
         throw new ApiErrorException(
            HttpStatus.BAD_REQUEST,
            ApiErrorCode.ValidationFailed,
            'Invalid tutorial progress field',
            {
               validations: ['updates must be an object'],
            },
         );
      }

      const validations: string[] = [];
      const normalized: Partial<Record<ActiveTutorialProgressField, boolean>> = {};

      for (const [field, value] of Object.entries(updates)) {
         if (!this.isActiveTutorialProgressField(field)) {
            validations.push(`updates.${field} is not allowed`);
            continue;
         }

         if (typeof value !== 'boolean') {
            validations.push(`updates.${field} must be a boolean value`);
            continue;
         }

         normalized[field] = value;
      }

      if (Object.keys(updates).length === 0) {
         validations.push('updates must include at least one tutorial progress field');
      }

      if (validations.length > 0) {
         throw new ApiErrorException(
            HttpStatus.BAD_REQUEST,
            ApiErrorCode.ValidationFailed,
            'Invalid tutorial progress field',
            {
               validations,
            },
         );
      }

      return normalized;
   }

   private validateActiveStateTransitions(
      updates: Partial<Record<ActiveTutorialProgressField, boolean>>,
      current: TutorialProgressState,
      heroes: HeroInventoryState[],
   ): string[] {
      const validations: string[] = [];

      if (updates.finishFirstDeploy === true && !current.finishOnboarding && updates.finishOnboarding !== true) {
         validations.push('updates.finishFirstDeploy requires finishOnboarding to be true');
      }

      if (updates.isDoneUpgradeUnitTutorial === true && !this.hasUpgradedHero(heroes)) {
         validations.push('updates.isDoneUpgradeUnitTutorial requires at least one hero with level greater than 1');
      }

      return validations;
   }

   private hasLegacyProgress(statistics: unknown): boolean {
      const source = this.asObject(statistics);
      return (
         Number(source.battlesPlayed ?? 0) > 0 ||
         Number(source.battlesWon ?? 0) > 0 ||
         Number(source.level ?? 1) > 1 ||
         Number(source.exp ?? 0) > 0 ||
         Number(source.stageCampaign ?? 1) > 1
      );
   }

   private hasSecondTutorialBattleProgress(statistics: unknown): boolean {
      const source = this.asObject(statistics);
      return Number(source.stageCampaign ?? 1) > 2 || Number(source.battlesWon ?? 0) > 1;
   }

   private hasUpgradedHero(heroes: HeroInventoryState[]): boolean {
      return heroes.some(hero => Number(this.asObject(hero.customData).lv ?? 1) > 1);
   }

   private readVerifiedActiveFlags(
      source: Record<string, unknown>,
   ): Partial<Record<ActiveTutorialProgressField, string>> {
      const raw = this.asObject(source[ACTIVE_TUTORIAL_PROGRESS_META_KEY]);
      const verified: Partial<Record<ActiveTutorialProgressField, string>> = {};

      for (const field of ACTIVE_TUTORIAL_PROGRESS_FIELDS) {
         if (typeof raw[field] === 'string' && !Number.isNaN(Date.parse(raw[field] as string))) {
            verified[field] = new Date(raw[field] as string).toISOString();
         }
      }

      return verified;
   }

   private markActiveFieldCompleted(
      source: Record<string, unknown>,
      field: ActiveTutorialProgressField,
   ): Record<string, unknown> {
      const completedAt = new Date().toISOString();
      const verifiedActiveFlags = this.readVerifiedActiveFlags(source);

      return {
         ...source,
         [field]: true,
         updatedAt: completedAt,
         [ACTIVE_TUTORIAL_PROGRESS_META_KEY]: {
            ...verifiedActiveFlags,
            [field]: completedAt,
         },
      };
   }

   private hasStoredStateChanged(currentValue: unknown, nextValue: Record<string, unknown>): boolean {
      const current = this.asObject(currentValue);
      const currentMeta = this.readVerifiedActiveFlags(current);
      const nextMeta = this.readVerifiedActiveFlags(nextValue);

      if (current.updatedAt !== nextValue.updatedAt) {
         return true;
      }

      if (
         ACTIVE_TUTORIAL_PROGRESS_FIELDS.some(field => currentMeta[field] !== nextMeta[field])
      ) {
         return true;
      }

      return TUTORIAL_PROGRESS_FIELDS.some(field => current[field] !== nextValue[field]);
   }

   private asObject(value: unknown): Record<string, unknown> {
      return (value as Record<string, unknown>) ?? {};
   }

   private isActiveTutorialProgressField(field: string): field is ActiveTutorialProgressField {
      return (ACTIVE_TUTORIAL_PROGRESS_FIELDS as readonly string[]).includes(field);
   }
}

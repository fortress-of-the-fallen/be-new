import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiErrorCode } from 'src/api/api-error-code';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import {
   buildDefaultTutorialProgress,
   TUTORIAL_PROGRESS_FIELDS,
   TutorialProgressField,
   TutorialProgressState,
} from './tutorial-progress.constant';

type PrismaDbClient = any;

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
   ): TutorialProgressState {
      const source = this.asObject(value);
      const defaults = buildDefaultTutorialProgress(fallbackUpdatedAt ?? new Date());
      const normalized = {
         ...defaults,
      };

      for (const field of TUTORIAL_PROGRESS_FIELDS) {
         if (typeof source[field] === 'boolean') {
            normalized[field] = source[field] as boolean;
         }
      }

      if (this.hasLegacyProgress(statistics)) {
         normalized.finishOnboarding = true;
      }

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

      const updates = this.validateUpdates(input.updates);
      const current = this.normalize(player.tutorialProgress, player.statistics, player.updatedAt);
      const next = {
         ...current,
      };

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

         next[field] = current[field] || value;
      }

      const nextUpdatedAt = new Date();
      next.updatedAt = nextUpdatedAt.toISOString();

      await db.player.update({
         where: {
            id: input.playerId,
         },
         data: {
            tutorialProgress: next,
         },
      });

      return next;
   }

   applyOnboardingBattleWin(
      value: unknown,
      statistics: unknown,
      fallbackUpdatedAt?: Date,
   ): {
      tutorialProgress: TutorialProgressState;
      changed: boolean;
   } {
      const current = this.normalize(value, statistics, fallbackUpdatedAt);
      const next = {
         ...current,
      };

      for (const field of ['finishOnboarding', 'finishIntro', 'finishFirstDeploy', 'finishFirstBattle'] as const) {
         next[field] = true;
      }

      const changed = this.hasStateChanged(current, next);
      if (changed) {
         next.updatedAt = new Date().toISOString();
      }

      return {
         tutorialProgress: next,
         changed,
      };
   }

   private validateUpdates(updates: Record<string, unknown>): Partial<Record<TutorialProgressField, boolean>> {
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
      const normalized: Partial<Record<TutorialProgressField, boolean>> = {};

      for (const [field, value] of Object.entries(updates)) {
         if (!this.isTutorialProgressField(field)) {
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

   private hasStateChanged(current: TutorialProgressState, next: TutorialProgressState): boolean {
      return TUTORIAL_PROGRESS_FIELDS.some(field => current[field] !== next[field]);
   }

   private asObject(value: unknown): Record<string, unknown> {
      return (value as Record<string, unknown>) ?? {};
   }

   private isTutorialProgressField(field: string): field is TutorialProgressField {
      return (TUTORIAL_PROGRESS_FIELDS as readonly string[]).includes(field);
   }
}

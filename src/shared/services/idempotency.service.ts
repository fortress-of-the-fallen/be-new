import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import { HashHelper } from 'src/shared/helper/hash.helper';
import { stableJsonStringify } from 'src/shared/helper/stable-json.helper';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

type PrismaDbClient = any;

@Injectable()
export class IdempotencyService {
   constructor(private readonly prisma: PrismaService) {}

   async execute<T>(input: {
      playerId: string;
      idempotencyKey: string;
      action: string;
      requestBody: unknown;
      handler: (db: PrismaDbClient) => Promise<T>;
      db?: PrismaDbClient;
   }): Promise<T> {
      const db = input.db ?? this.prisma;

      if (!input.idempotencyKey?.trim()) {
         throw new ApiErrorException(
            HttpStatus.BAD_REQUEST,
            ApiErrorCode.ValidationFailed,
            'idempotencyKey is required',
         );
      }

      const normalizedKey = input.idempotencyKey.trim();
      const requestHash = HashHelper.hashString(
         stableJsonStringify({
            action: input.action,
            body: input.requestBody,
         }),
      );

      const existing = await this.findRecord(db, input.playerId, normalizedKey);
      if (existing) {
         this.assertRecordMatches(existing, input.action, requestHash);
         return existing.response as T;
      }

      const response = await input.handler(db);

      try {
         await db.idempotencyRecord.create({
            data: {
               playerId: input.playerId,
               idempotencyKey: normalizedKey,
               action: input.action,
               requestHash,
               response,
            },
         });
      } catch (error) {
         const knownError = error as { code?: string } | undefined;
         if (knownError?.code !== 'P2002') {
            throw error;
         }

         const concurrentRecord = await this.findRecord(db, input.playerId, normalizedKey);
         if (!concurrentRecord) {
            throw error;
         }

         this.assertRecordMatches(concurrentRecord, input.action, requestHash);
         return concurrentRecord.response as T;
      }

      return response;
   }

   private async findRecord(db: PrismaDbClient, playerId: string, idempotencyKey: string) {
      return db.idempotencyRecord.findUnique({
         where: {
            playerId_idempotencyKey: {
               playerId,
               idempotencyKey,
            },
         },
      });
   }

   private assertRecordMatches(
      record: {
         action: string;
         requestHash: string;
      },
      action: string,
      requestHash: string,
   ) {
      if (record.action !== action || record.requestHash !== requestHash) {
         throw new ApiErrorException(
            HttpStatus.CONFLICT,
            ApiErrorCode.IdempotencyConflict,
            'Same idempotency key was already used for a different request payload',
         );
      }
   }
}

import { ClientSession, Model } from 'mongoose';
import { IBaseWriteUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-write.unit-of-work';
import { IBaseEntity } from 'src/domain/entity/base/i-base.entity';
import { WriteRepository } from '../repository/write.repository';
import { Injectable, Scope } from '@nestjs/common';
import { ConfigKeyConstant } from 'src/domain/constant/configkey.constant';
import { NodeEnv } from 'src/domain/enum/node_env';
import { AnyBulkWriteOperation } from 'mongodb';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { ReadUnitOfWork } from './read.unit-of-work';
import { ModuleRef } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { ICacheManager } from 'src/application/interface/cache-manager/i-cache-manager';

@Injectable({ scope: Scope.REQUEST })
class WriteUnitOfWork extends ReadUnitOfWork implements IBaseWriteUnitOfWork {
   private bulkOperations = new Map<string, AnyBulkWriteOperation<any>[]>();

   constructor(
      protected readonly moduleRef: ModuleRef,
      protected readonly logger: ILogger,
      protected readonly cacheManager: ICacheManager,
   ) {
      super(moduleRef, logger, cacheManager);
      this.logger.setContext(WriteUnitOfWork.name);
   }

   override getRepository<T extends IBaseEntity>(name: string): WriteRepository<T> {
      if (!this.repositories.has(name)) {
         const model = this.moduleRef.get<Model<T>>(getModelToken(name), { strict: false });
         this.repositories.set(
            name,
            new WriteRepository<T>(model, this.bulkOperations, this.cacheManager),
         );
      }
      return this.repositories.get(name) as WriteRepository<T>;
   }

   async saveChanges(): Promise<void> {
      if (this.bulkOperations.size === 0) return;

      let session: ClientSession | undefined;

      try {
         if (ConfigKeyConstant.NodeEnv === NodeEnv.Production) {
            session = await this.moduleRef
               .get<Model<any>>(getModelToken('session'), { strict: false })
               .startSession();
            await session.withTransaction(async () => {
               await this.executeBulkWrites(session);
            });
         } else {
            await this.executeBulkWrites();
         }
      } catch (error) {
         console.error('Transaction failed:', error);
         throw error;
      } finally {
         await session?.endSession();
         this.bulkOperations.clear();
      }
   }

   private async executeBulkWrites(session?: ClientSession) {
      for (const [modelName, ops] of this.bulkOperations.entries()) {
         if (ops.length === 0) continue;
         const model = this.moduleRef.get<Model<any>>(getModelToken(modelName), { strict: false });
         await model.bulkWrite(ops, { session });
      }
   }
}

export { WriteUnitOfWork };

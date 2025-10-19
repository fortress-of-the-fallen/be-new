import { Model, Types } from 'mongoose';
import { IBaseWriteRepository } from 'src/application/interface/data-access/base-data-access/repository/i-base-write.repository';
import { IBaseEntity } from 'src/domain/entity/base/i-base.entity';
import { ReadRepository } from './read.repository';
import { AnyBulkWriteOperation, Filter, UpdateFilter } from 'mongodb';
import { ICacheManager } from 'src/application/interface/cache-manager/i-cache-manager';

class WriteRepository<T extends IBaseEntity>
   extends ReadRepository<T>
   implements IBaseWriteRepository<T>
{
   constructor(
      model: Model<T>,
      private bulkOperations: Map<string, AnyBulkWriteOperation<any>[]>,
      protected readonly cacheManager: ICacheManager,
   ) {
      super(model, cacheManager);
   }

   private getOpsList(): AnyBulkWriteOperation<any>[] {
      const ops = this.bulkOperations.get(this.model.modelName) || [];
      this.bulkOperations.set(this.model.modelName, ops);
      return ops;
   }

   add(entity: Partial<T>): Promise<void> {
      this.getOpsList().push({
         insertOne: { document: entity },
      });
      return Promise.resolve();
   }

   addMany(entities: Partial<T>[]): Promise<void> {
      const ops = this.getOpsList();
      for (const entity of entities) {
         ops.push({ insertOne: { document: entity } });
      }
      return Promise.resolve();
   }

   update(entity: Partial<T> & { _id: string }): Promise<void> {
      const { _id, ...rest } = entity;
      this.getOpsList().push({
         updateOne: {
            filter: { _id } as Filter<any>,
            update: { $set: rest } as UpdateFilter<any>,
            upsert: false,
         },
      });
      return Promise.resolve();
   }

   updateMany(entities: (Partial<T> & { _id: Types.ObjectId })[]): Promise<void> {
      const ops = this.getOpsList();
      for (const entity of entities) {
         const { _id, ...rest } = entity;
         ops.push({
            updateOne: {
               filter: { _id },
               update: { $set: rest },
               upsert: false,
            },
         });
      }
      return Promise.resolve();
   }

   async updateWithOperator(filter: any, update: any): Promise<void> {
      await this.model.updateOne(filter, update).exec();
   }

   delete(id: string): Promise<void> {
      this.getOpsList().push({
         updateOne: {
            filter: { _id: id },
            update: { $set: { isDeleted: true } },
         },
      });
      return Promise.resolve();
   }

   hardDelete(id: string): Promise<void> {
      this.getOpsList().push({
         deleteOne: { filter: { _id: id } },
      });
      return Promise.resolve();
   }

   deleteMany(ids: string[]): Promise<void> {
      const ops = this.getOpsList();
      for (const id of ids) {
         ops.push({
            updateOne: {
               filter: { _id: id },
               update: { $set: { isDeleted: true } },
            },
         });
      }
      return Promise.resolve();
   }

   hardDeleteMany(ids: string[]): Promise<void> {
      const ops = this.getOpsList();
      for (const id of ids) {
         ops.push({
            deleteOne: { filter: { _id: id } },
         });
      }
      return Promise.resolve();
   }
}

export { WriteRepository };

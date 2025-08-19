import { Types } from 'mongoose';
import { IBaseReadRepository } from './i-base-read.repository';

interface IBaseWriteRepository<T> extends IBaseReadRepository<T> {
   add(entity: Partial<T>): Promise<void>;
   addMany(entities: Partial<T>[]): Promise<void>;

   update(entity: Partial<T> & { _id: string }): Promise<void>;
   updateMany(entities: (Partial<T> & { _id: Types.ObjectId })[]): Promise<void>;
   updateWithOperator(filter: any, update: any): Promise<void>;

   delete(id: string): Promise<void>;
   hardDelete(id: string): Promise<void>;
   deleteMany(ids: string[]): Promise<void>;
   hardDeleteMany(ids: string[]): Promise<void>;
}

export { IBaseWriteRepository };

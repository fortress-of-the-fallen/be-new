import { IBaseReadRepository } from 'src/application/interface/data-access/base-data-access/repository/i-base-read.repository';
import { Queryable } from '../../queryable';
import { IBaseEntity } from 'src/domain/entity/base/i-base.entity';
import { FilterQuery, Model } from 'mongoose';
import { IQueryable } from 'src/application/interface/data-access/i-queryable';
import { HashHelper } from 'src/domain/helper/hash.helper';
import { ICacheManager } from 'src/application/interface/cache-manager/i-cache-manager';

type Condition<T> = FilterQuery<T>;
class ReadRepository<T extends IBaseEntity> implements IBaseReadRepository<T> {
   constructor(
      protected readonly model: Model<T>,
      protected readonly cacheManager: ICacheManager,
   ) {}

   getBackupData(): Promise<any[]> {
      return this.model.find().lean();
   }

   count(condition: Condition<T>): Promise<number> {
      return this.model
         .countDocuments({
            ...condition,
            isDeleted: false,
            isLocked: false,
         })
         .exec();
   }

   async single(condition: Condition<T>): Promise<T | null> {
      const hashQuery = HashHelper.hashString(JSON.stringify(condition));
      const cachedResult = await this.cacheManager.get<T>(hashQuery);

      if (cachedResult) {
         return cachedResult;
      } else {
         const result = await this.model.findOne(condition).exec();
         await this.cacheManager.set<T>(hashQuery, result as T, 5);
         return result as T;
      }
   }

   async any(condition: Condition<T>): Promise<boolean> {
      const hashQuery = HashHelper.hashString(JSON.stringify(condition));
      const cachedResult = await this.cacheManager.get<boolean>(hashQuery);

      if (cachedResult) {
         return cachedResult;
      }

      const exists = await this.model.exists(condition).exec();
      const isExist = !!exists;
      await this.cacheManager.set<boolean>(hashQuery, isExist, 5);
      return isExist;
   }

   queryCondition(condition: Condition<T>): IQueryable<T> {
      const finalCondition = {
         isLocked: false,
         isDeleted: false,
         ...condition,
      };

      return new Queryable(this.model).where(finalCondition);
   }

   queryAll(): IQueryable<T> {
      return new Queryable(this.model).where({
         isDeleted: false,
         isLocked: false,
      } as Condition<T>);
   }
}

export { ReadRepository };

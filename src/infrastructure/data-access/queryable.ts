import { FilterQuery, Model, PopulateOptions, Query } from 'mongoose';
import { IQueryable } from 'src/application/interface/data-access/i-queryable';
import { IBaseEntity } from 'src/domain/entity/base/i-base.entity';

type Condition<T> = Partial<T>;
type LookupOptions = {
   from: string;
   localField: string;
   foreignField: string;
   as: string;
   isArray?: boolean;
};
class Queryable<T extends IBaseEntity> implements IQueryable<T> {
   constructor(private readonly model: Model<T>) {}

   private _lookups: LookupOptions[] = [];
   private _conditions: Condition<T>[] = [];
   private _select: string[] = [];
   private _skip?: number;
   private _limit?: number;
   private _sort: Record<string, 1 | -1> = {};
   private _populate: (string | { path: string; select?: string; match?: any })[] = [];

   join(
      field: string | { path: string; select?: string; match?: any; options?: any },
   ): IQueryable<T> {
      this._populate.push(field);
      return this;
   }

   lookup(options: LookupOptions): IQueryable<T> {
      this._lookups.push(options);
      return this;
   }

   where(condition: Condition<T>): IQueryable<T> {
      this._conditions.push(condition);
      return this;
   }

   select(fields: string[]): IQueryable<T> {
      this._select = fields;
      return this;
   }

   skip(skip: number): IQueryable<T> {
      this._skip = skip;
      return this;
   }

   orderBy(field: string): IQueryable<T> {
      this._sort[field] = 1;
      return this;
   }

   take(take: number): IQueryable<T> {
      this._limit = take;
      return this;
   }

   orderByDescending(field: string): IQueryable<T> {
      this._sort[field] = -1;
      return this;
   }

   async exec(): Promise<T[]> {
      const filter = Object.assign({}, ...this._conditions);
      let query: Query<T[], T> = this.model.find(filter as FilterQuery<T>);

      if (this._lookups.length > 0) {
         const pipeline: any[] = [];
         if (Object.keys(filter).length > 0) {
            pipeline.push({ $match: filter });
         }

         for (const lookup of this._lookups) {
            pipeline.push({
               $lookup: {
                  from: lookup.from,
                  let: { localValue: `$${lookup.localField}` },
                  pipeline: [
                     {
                        $match: {
                           $expr: { $eq: [`$$localValue`, `$${lookup.foreignField}`] },
                        },
                     },
                  ],
                  as: lookup.as,
               },
            });
         }
      }
      if (this._select.length > 0) query = query.select(this._select.join(' '));
      if (this._skip !== undefined) query = query.skip(this._skip);
      if (this._limit !== undefined) query = query.limit(this._limit);
      if (Object.keys(this._sort).length > 0) query = query.sort(this._sort);
      if (this._populate.length > 0) {
         for (const field of this._populate) {
            query = query.populate(field as PopulateOptions) as any;
         }
      }

      return query.exec();
   }
}

export { Queryable };

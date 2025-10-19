type Condition<T> = Partial<T>;
type LookupOptions = {
   from: string;
   localField: string;
   foreignField: string;
   as: string;
   isArray?: boolean;
};
interface IQueryable<T> {
   lookup(options: LookupOptions): IQueryable<T>;
   join(
      field: string | { path: string; select?: string; match?: any; options?: any },
   ): IQueryable<T>;

   where(condition: Condition<T>): IQueryable<T>;

   select(fields: string[]): IQueryable<T>;
   skip(skip: number): IQueryable<T>;
   take(take: number): IQueryable<T>;

   orderBy(field: string): IQueryable<T>;
   orderByDescending(field: string): IQueryable<T>;

   exec(): Promise<T[]>;
}

export { IQueryable };

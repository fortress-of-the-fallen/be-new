import { IQueryable } from 'src/application/interface/data-access/i-queryable';

type Condition<T> = Partial<T>;
interface IUniReadRepository<T> {
   getBackupData(): Promise<any[]>;
   count(condition: Condition<T>): Promise<number>;
   single(condition: Condition<T>): Promise<T | null>;
   any(condition: Condition<T>): Promise<boolean>;
   queryCondition(condition: Condition<T>): IQueryable<T>;
   queryAll(): IQueryable<T>;
}

export { IUniReadRepository };

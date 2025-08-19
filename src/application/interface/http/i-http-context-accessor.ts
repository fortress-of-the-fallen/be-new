export interface IHttpContextAccessor {
   get<T = any>(): T | undefined;
   set<T = any>(context: T): void;

   clear(): void;
}

export const IHttpContextAccessor = Symbol('IHttpContextAccessor');

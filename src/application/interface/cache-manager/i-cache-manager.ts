export interface ICacheManager {
   expire(key: string, ttlInSeconds: number): Promise<void>;

   set<T>(key: string, value: T, ttlInSeconds?: number): Promise<void>;

   get<T>(key: string): Promise<T | null>;

   delete(key: string): Promise<void>;

   has(key: string): Promise<boolean>;
}

export const ICacheManager = Symbol('ICacheManager');

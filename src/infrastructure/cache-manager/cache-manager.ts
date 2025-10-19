import { Inject, Injectable, Scope } from '@nestjs/common';
import Redis from 'ioredis';
import { ICacheManager } from 'src/application/interface/cache-manager/i-cache-manager';
import { ILogger } from 'src/application/interface/logger/i-logger';

@Injectable({ scope: Scope.REQUEST })
export class RedisCacheManager implements ICacheManager {
   constructor(
      @Inject('REDIS_CLIENT') private readonly redis: Redis,
      @Inject(ILogger) private readonly logger: ILogger,
   ) {
      this.logger.setContext(RedisCacheManager.name);
      this.logger.debug('RedisCacheManager initialized');
   }

   async expire(key: string, ttlInSeconds: number): Promise<void> {
      await this.redis.expire(key, ttlInSeconds);
      this.logger.debug(`Cache for key "${key}" set to expire in ${ttlInSeconds} seconds`);
   }

   async set<T>(key: string, value: T, ttlInSeconds = 60): Promise<void> {
      const val = JSON.stringify(value);

      this.logger.debug(`Setting cache for key "${key}" with TTL ${ttlInSeconds} seconds`);
      await this.redis.set(key, val, 'EX', ttlInSeconds);
   }

   async get<T>(key: string): Promise<T | null> {
      if (!key) {
         this.logger.debug(`No key provided for cache get`);
         return null;
      }

      try {
         const result = await this.redis.get(key);
         this.logger.debug(`Cache get for key "${key}" successful`);
         return result ? (JSON.parse(result) as T) : null;
      } catch (err) {
         this.logger.error(`Redis GET failed for key "${key}": ${err.message}`);
         return null;
      }
   }

   async delete(key: string): Promise<void> {
      this.logger.debug(`Deleting cache for key "${key}"`);
      await this.redis.del(key);
   }

   async has(key: string): Promise<boolean> {
      const result = await this.redis.exists(key);
      return result === 1;
   }
}

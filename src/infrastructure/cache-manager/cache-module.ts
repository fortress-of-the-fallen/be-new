import { Module } from '@nestjs/common';
import { ICacheManager } from 'src/application/interface/cache-manager/i-cache-manager';
import { RedisCacheManager } from './cache-manager';
import Redis from 'ioredis';
import { ConfigKeyConstant } from 'src/domain/constant/configkey.constant';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { Logger } from '../logger/logger';

@Module({
   providers: [
      {
         provide: ILogger,
         useClass: Logger,
      },
      {
         provide: ICacheManager,
         useClass: RedisCacheManager,
      },
      {
         provide: 'REDIS_CLIENT',
         useFactory: () => {
            return new Redis({
               host: ConfigKeyConstant.Redis.Host,
               port: ConfigKeyConstant.Redis.Port,
               password: ConfigKeyConstant.Redis.Password,
               db: 0,
            });
         },
      },
   ],
   exports: [ICacheManager],
})
export class CacheModule {}

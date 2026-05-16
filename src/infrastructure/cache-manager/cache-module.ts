import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigKeyConstant } from 'src/shared/constant/configkey.constant';

@Module({
   providers: [
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
   exports: ['REDIS_CLIENT'],
})
export class CacheModule {}

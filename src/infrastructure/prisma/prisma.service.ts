import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigKeyConstant } from 'src/shared/constant/configkey.constant';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
   constructor() {
      super({
         datasources: {
            db: {
               url: PrismaService.buildMongoDbUrl(),
            },
         },
      });
   }

   async onModuleInit(): Promise<void> {
      await this.$connect();
   }

   async enableShutdownHooks(app: INestApplication): Promise<void> {
      this.$on('beforeExit', () => {
         void app.close();
      });
   }

   private static buildMongoDbUrl(): string {
      const raw = ConfigKeyConstant.DateBase.ConnectionUrl;
      const dbName = ConfigKeyConstant.DateBase.BaseDbName;

      if (!raw) {
         throw new Error('MongoDB connection URL is not configured');
      }

      const url = new URL(raw);
      url.pathname = `/${dbName}`;
      if (!url.searchParams.get('authSource')) {
         url.searchParams.set('authSource', 'admin');
      }

      return url.toString();
   }
}

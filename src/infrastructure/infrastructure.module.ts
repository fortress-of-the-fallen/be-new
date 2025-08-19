import { Module } from '@nestjs/common';
import { MediatorModule } from './mediator/mediator.module';
import { LoggerModule } from './logger/logger.module';
import { CacheModule } from './cache-manager/cache-module';
import { HttpModule } from './http/http.module';
import { FileServiceModule } from './file-service.ts/file-service.module';
import { MailServiceModule } from './mail-service/mail-service.module';
import { DataAccessModule } from './data-access/data-access.module';
import { BackgroundHandlerModule } from './background-handler/background-handler.module';

const dependencies = [
   DataAccessModule,
   MediatorModule,
   LoggerModule,
   CacheModule,
   HttpModule,
   FileServiceModule,
   MailServiceModule,
   BackgroundHandlerModule,
];

@Module({
   imports: dependencies,
   exports: dependencies,
})
export class InfrastructureModule {}

import { Module, Scope } from '@nestjs/common';
import { MailService } from './mail-service';
import { IMailService } from 'src/application/interface/mail-service/i-mail-service';
import { GmailServiceConfig } from './gmail-service.config';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { Logger } from '../logger/logger';

@Module({
   providers: [
      GmailServiceConfig,
      {
         provide: IMailService,
         useClass: MailService,
         scope: Scope.REQUEST,
      },
      {
         provide: ILogger,
         useClass: Logger,
      },
   ],
   exports: [IMailService],
})
export class MailServiceModule {}

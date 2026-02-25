import { Module, Scope } from '@nestjs/common';
import { MailService } from './mail-service';
import { GmailServiceConfig } from './gmail-service.config';

@Module({
   providers: [
      GmailServiceConfig,
      {
         provide: MailService,
         useClass: MailService,
         scope: Scope.REQUEST,
      },
   ],
   exports: [MailService],
})
export class MailServiceModule {}

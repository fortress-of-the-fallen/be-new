import { Inject, Injectable, Scope } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { IMailService } from 'src/application/interface/mail-service/i-mail-service';
import { ConfigKeyConstant } from 'src/domain/constant/configkey.constant';
import { GmailServiceConfig } from './gmail-service.config';
import { ILogger } from 'src/application/interface/logger/i-logger';

@Injectable({ scope: Scope.REQUEST })
export class MailService implements IMailService {
   private transporter: nodemailer.Transporter;

   constructor(
      @Inject(GmailServiceConfig)
      private readonly gmailServiceConfig: GmailServiceConfig,

      @Inject(ILogger)
      private readonly logger: ILogger,
   ) {
      this.transporter = this.gmailServiceConfig.getClient();
      logger.setContext(MailService.name);
   }

   async sendMail(to: string, subject: string, html: string): Promise<void> {
      try {
         await this.transporter.sendMail({
            from: ConfigKeyConstant.Smtp.User,
            to,
            subject,
            html,
         });

         this.logger.log(`Email sent to ${to} with subject "${subject}"`);
      } catch (error) {
         this.logger.error('Failed to send email', JSON.stringify(error));
      }
   }
}

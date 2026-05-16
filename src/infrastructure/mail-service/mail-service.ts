import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigKeyConstant } from 'src/shared/constant/configkey.constant';
import { GmailServiceConfig } from './gmail-service.config';

@Injectable({ scope: Scope.REQUEST })
export class MailService {
   private transporter: nodemailer.Transporter;
   private readonly logger = new Logger(MailService.name);

   constructor(
      @Inject(GmailServiceConfig)
      private readonly gmailServiceConfig: GmailServiceConfig,
   ) {
      this.transporter = this.gmailServiceConfig.getClient();
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

import { Injectable, Scope } from '@nestjs/common';
import { ConfigKeyConstant } from 'src/domain/constant/configkey.constant';
import * as nodemailer from 'nodemailer';

@Injectable({ scope: Scope.DEFAULT })
export class GmailServiceConfig {
   private transporter: nodemailer.Transporter;

   constructor() {
      this.transporter = nodemailer.createTransport({
         host: ConfigKeyConstant.Smtp.Host,
         port: ConfigKeyConstant.Smtp.Port,
         secure: ConfigKeyConstant.Smtp.Secure,
         auth: {
            user: ConfigKeyConstant.Smtp.User,
            pass: ConfigKeyConstant.Smtp.Password,
         },
         pool: true,
      });
   }

   getClient(): nodemailer.Transporter {
      return this.transporter;
   }
}

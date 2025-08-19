import { Inject, Injectable, LoggerService, Scope } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { ConfigKeyConstant } from 'src/domain/constant/configkey.constant';
import { NodeEnv } from 'src/domain/enum/node_env';

@Injectable({ scope: Scope.TRANSIENT })
export class Logger implements ILogger {
   constructor(
      @Inject(WINSTON_MODULE_NEST_PROVIDER)
      private readonly logger: LoggerService,
   ) {}

   private context?: string;

   setContext(context: string): void {
      this.context = context;
   }

   log(message: any) {
      const msg = typeof message === 'object' ? JSON.stringify(message) : message;

      this.logger.log({ level: 'info', message: msg, context: this.context });
   }

   error(message: any, trace?: string) {
      const msg = typeof message === 'object' ? JSON.stringify(message) : message;
      this.logger.log({
         level: 'error',
         message: msg,
         stack: trace,
         context: this.context,
      });
   }

   warn(message: any) {
      const msg = typeof message === 'object' ? JSON.stringify(message) : message;

      this.logger.log({
         level: 'warn',
         message: msg,
         context: this.context,
      });
   }

   debug(message: any) {
      const msg = typeof message === 'object' ? JSON.stringify(message) : message;

      if (ConfigKeyConstant.NodeEnv !== NodeEnv.Development) {
         return;
      }

      this.logger.log({
         level: 'debug',
         message: msg,
         context: this.context,
      });
   }

   verbose(message: any) {
      const msg = typeof message === 'object' ? JSON.stringify(message) : message;

      this.logger.log({
         level: 'verbose',
         message: msg,
         context: this.context,
      });
   }
}

import { Module, Scope } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import chalk from 'chalk';
import { Logger } from './logger';
import { ILogger } from 'src/application/interface/logger/i-logger';
import DailyRotateFile from 'winston-daily-rotate-file';

function getLevelColor(level: string) {
   switch (level) {
      case 'error':
         return chalk.red;
      case 'warn':
         return chalk.yellow;
      case 'info':
         return chalk.green;
      case 'debug':
         return chalk.blue;
      case 'verbose':
         return chalk.magenta;
      default:
         return chalk.white;
   }
}

const consoleFormat = winston.format.combine(
   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
   winston.format.printf(({ level, message, timestamp, context, stack }) => {
      const coloredLevel = chalk.bold(getLevelColor(level)(level.toUpperCase()));
      const coloredTimestamp = chalk.gray(timestamp);
      const coloredContext = context ? chalk.cyan(`[${context}]`) : '';
      const coloredMessage = chalk.white(message);
      const coloredError = stack ? chalk.red(`\n${stack}`) : '';
      return `${coloredTimestamp} ${coloredLevel}: ${coloredContext} ${coloredMessage}${coloredError}`;
   }),
);

const fileFormat = winston.format.combine(
   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
   winston.format.printf(({ timestamp, level, message, context, stack }) => {
      const ctx = context ? `[${context}] ` : '';
      const err = stack ? `\n${stack}` : '';
      return `${timestamp} ${level.toUpperCase()}: ${ctx}${message}${err}`;
   }),
);

@Module({
   imports: [
      WinstonModule.forRoot({
         transports: [
            new winston.transports.Console({
               format: consoleFormat,
               level: 'debug',
            }),
            new DailyRotateFile({
               filename: 'logs/%DATE%.log',
               datePattern: 'YYYY-MM-DD',
               maxSize: '20m',
               maxFiles: '14d',
               level: 'info',
               format: fileFormat,
            }),
            new DailyRotateFile({
               filename: 'logs/%DATE%.log',
               datePattern: 'YYYY-MM-DD',
               maxSize: '10m',
               maxFiles: '30d',
               level: 'error',
               format: fileFormat,
            }),
         ],
      }),
   ],
   providers: [
      Logger,
      {
         provide: ILogger,
         useClass: Logger,
         scope: Scope.TRANSIENT,
      },
   ],
   exports: [ILogger],
})
export class LoggerModule {}

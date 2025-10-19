export interface ILogger {
   setContext(context: string): void;
   log(message: any): void;
   error(message: any, trace?: string): void;
   warn(message: any): void;
   debug(message: any): void;
   verbose(message: any): void;
}

export const ILogger = Symbol('Logger');

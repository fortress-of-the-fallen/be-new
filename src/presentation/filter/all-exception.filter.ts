import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ExecutionRes } from '../model/res/base/execution-res.model';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';
import { ReqValidateFilter } from './req-validate.filter';
import { ValidateException } from 'src/domain/exception/validate-exception';

@Catch(Error)
export class AllExceptionFilter implements ExceptionFilter {
   constructor(
      private readonly logger: ILogger,
      private readonly httpFilter: HttpExceptionFilter,
      private readonly reqValidationFilter: ReqValidateFilter,
   ) {
      this.logger.setContext(AllExceptionFilter.name);
   }

   catch(exception: Error, host: ArgumentsHost) {
      if (exception instanceof HttpException) {
         this.httpFilter.catch(exception, host);
         return;
      }

      if (exception instanceof ValidateException) {
         this.reqValidationFilter.catch(exception, host);
         return;
      }

      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      const res: ExecutionRes = new ExecutionRes();
      res.success = false;
      res.error = 'An unexpected error occurred';

      this.logger.error('Unhandled exception:', exception.message);

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(res);
   }
}

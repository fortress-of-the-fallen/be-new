import {
   ArgumentsHost,
   Catch,
   ExceptionFilter,
   HttpException,
   HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorCode } from 'src/api/api-error-code';
import { buildErrorResponse } from '../model/res/base/api-envelope.model';
import { HttpExceptionFilter } from './http-exception.filter';
import { ReqValidateFilter } from './req-validate.filter';
import { ValidateException } from 'src/shared/exception/validate-exception';

@Catch(Error)
export class AllExceptionFilter implements ExceptionFilter {
   constructor(
      private readonly httpFilter: HttpExceptionFilter,
      private readonly reqValidationFilter: ReqValidateFilter,
   ) {}

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
      response
         .status(HttpStatus.INTERNAL_SERVER_ERROR)
         .json(
            buildErrorResponse(
               ApiErrorCode.InternalServerError,
               exception.message || 'Unexpected server error',
            ),
         );
   }
}

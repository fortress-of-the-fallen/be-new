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

@Catch(HttpException)
class HttpExceptionFilter implements ExceptionFilter {
   catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ApiErrorCode.InternalServerError;
      let errorMessage = 'Unexpected server error';
      let errorDetails: unknown = {};

      status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;

      const exceptionResponse = exception.getResponse?.() ?? '';

      if (typeof exceptionResponse === 'string') {
         errorMessage = exceptionResponse;
      } else if (
         typeof exceptionResponse === 'object' &&
         exceptionResponse !== null &&
         'message' in exceptionResponse
      ) {
         const messageObj = exceptionResponse as NestErrorResponse;
         errorCode = messageObj.code ?? this.mapStatusToCode(status);
         errorMessage =
            typeof messageObj.message === 'string'
               ? messageObj.message
               : Array.isArray(messageObj.message)
                 ? messageObj.message.join(', ')
                 : errorMessage;
         errorDetails = messageObj.details ?? {};
      } else {
         errorCode = this.mapStatusToCode(status);
      }

      response.status(status).json(buildErrorResponse(errorCode, errorMessage, errorDetails));
   }

   private mapStatusToCode(status: number): ApiErrorCode {
      switch (status) {
         case HttpStatus.BAD_REQUEST:
            return ApiErrorCode.ValidationFailed;
         case HttpStatus.UNAUTHORIZED:
            return ApiErrorCode.Unauthorized;
         case HttpStatus.FORBIDDEN:
            return ApiErrorCode.Forbidden;
         case HttpStatus.NOT_FOUND:
            return ApiErrorCode.NotFound;
         default:
            return ApiErrorCode.InternalServerError;
      }
   }
}

interface NestErrorResponse {
   code?: ApiErrorCode;
   details?: unknown;
   error?: string;
   message?: string | string[];
   statusCode?: number;
}

export { HttpExceptionFilter };

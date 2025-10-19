import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BaseMessage } from 'src/domain/message/base.message';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { ExecutionRes } from '../model/res/base/execution-res.model';

@Catch(HttpException)
class HttpExceptionFilter implements ExceptionFilter {
   constructor(private readonly logger: ILogger) {
      this.logger.setContext(HttpExceptionFilter.name);
   }

   catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      const res: ExecutionRes = new ExecutionRes();
      res.success = false;

      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorMessage = 'An internal error occurred';
      let errorCode = BaseMessage.EXCEPTION;

      status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;

      const exceptionResponse = exception.getResponse?.() ?? '';

      if (typeof exceptionResponse === 'string') {
         errorMessage = exceptionResponse;
      } else if (
         typeof exceptionResponse === 'object' &&
         exceptionResponse !== null &&
         'message' in exceptionResponse
      ) {
         this.logger.error('Exception response:', JSON.stringify(exceptionResponse));
         const messageObj = exceptionResponse as NestErrorResponse;
         errorMessage = messageObj.message ?? errorMessage;
      }

      switch (status) {
         case HttpStatus.BAD_REQUEST:
            errorCode = BaseMessage.BAD_REQUEST;
            break;
         case HttpStatus.TOO_MANY_REQUESTS:
            errorCode = BaseMessage.TOO_MANY_REQUESTS;
            break;
         case HttpStatus.INTERNAL_SERVER_ERROR:
            errorCode = BaseMessage.INTERNAL_SERVER_ERROR;
            break;
         case HttpStatus.UNAUTHORIZED:
            errorCode = BaseMessage.UNAUTHORIZED;
            break;
         case HttpStatus.FORBIDDEN:
            errorCode = BaseMessage.FORBIDDEN;
            break;
         default:
            errorCode = BaseMessage.EXCEPTION;
            break;
      }

      this.logger.error(`[HTTP Exception] ${JSON.stringify({ status, errorMessage })}`);

      res.errorCode = errorCode;
      response.status(status).json(res);
   }
}

interface NestErrorResponse {
   statusCode?: number;
   message?: string;
   error?: string;
}

export { HttpExceptionFilter };

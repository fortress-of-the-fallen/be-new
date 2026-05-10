import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { ValidateException } from 'src/shared/exception/validate-exception';
import { Response } from 'express';
import { ApiErrorCode } from 'src/api/api-error-code';
import { buildErrorResponse } from '../model/res/base/api-envelope.model';

@Catch(ValidateException)
class ReqValidateFilter implements ExceptionFilter {
   private readonly logger = new Logger(ReqValidateFilter.name);

   catch(exception: ValidateException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const status = HttpStatus.BAD_REQUEST;

      this.logger.error(`Validation failed: ${exception.message}`, exception.stack);
      response.status(status).json(
         buildErrorResponse(exception.errorCode ?? ApiErrorCode.ValidationFailed, exception.message, {
            validations: exception.validationErrors || [],
         }),
      );
   }
}
export { ReqValidateFilter };

import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { ValidateException } from 'src/shared/exception/validate-exception';
import { BaseMessage } from 'src/api/base.message';
import { Response } from 'express';
import { ExecutionRes } from '../model/res/base/execution-res.model';

@Catch(ValidateException)
class ReqValidateFilter implements ExceptionFilter {
   private readonly logger = new Logger(ReqValidateFilter.name);

   catch(exception: ValidateException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const status = HttpStatus.BAD_REQUEST;

      const res: ExecutionRes = new ExecutionRes();
      res.success = false;
      res.errorCode = BaseMessage.VALIDATION_ERROR;
      res.validates = exception.validationErrors || [];
      res.error = exception.message;

      this.logger.error(`Validation failed: ${exception.message}`, exception.stack);
      response.status(status).json(res);
   }
}
export { ReqValidateFilter };

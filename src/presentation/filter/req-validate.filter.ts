import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { ValidateException } from 'src/domain/exception/validate-exception';
import { BaseMessage } from 'src/domain/message/base.message';
import { Response } from 'express';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { ExecutionRes } from '../model/res/base/execution-res.model';

@Catch(ValidateException)
class ReqValidateFilter implements ExceptionFilter {
   constructor(private readonly logger: ILogger) {
      this.logger.setContext('ReqValidateFilter');
   }

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

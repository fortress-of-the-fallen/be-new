import {
   BadRequestException,
   CallHandler,
   ExecutionContext,
   Inject,
   Injectable,
   NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { BaseRes } from '../model/res/base/base-res.model';

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
   constructor(@Inject(ILogger) private readonly logger: ILogger) {
      this.logger.setContext('GlobalInterceptor');
   }

   intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
      return next.handle().pipe(
         tap(data => {
            if (!(data instanceof BaseRes)) {
               throw new BadRequestException('Response must be an instance of BaseResponse');
            }
         }),
      );
   }
}

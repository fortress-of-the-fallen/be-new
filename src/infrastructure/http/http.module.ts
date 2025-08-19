import { MiddlewareConsumer, Module, RequestMethod, Scope } from '@nestjs/common';
import { IHttpContextAccessor } from 'src/application/interface/http/i-http-context-accessor';
import { HttpContextMiddleware } from 'src/presentation/middleware/httpcontext-middleware';
import { HttpContextAccessor } from './http-context-accessor';

@Module({
   providers: [
      {
         provide: IHttpContextAccessor,
         useClass: HttpContextAccessor,
         scope: Scope.DEFAULT,
      },
   ],
   exports: [IHttpContextAccessor],
})
export class HttpModule {
   configure(consumer: MiddlewareConsumer) {
      consumer.apply(HttpContextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
   }
}

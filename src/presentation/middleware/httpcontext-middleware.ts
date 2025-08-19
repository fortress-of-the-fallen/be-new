import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IHttpContextAccessor } from 'src/application/interface/http/i-http-context-accessor';

@Injectable()
export class HttpContextMiddleware implements NestMiddleware {
   constructor(@Inject(IHttpContextAccessor) private readonly accessor: IHttpContextAccessor) {}

   use(req: Request, res: Response, next: NextFunction): void {
      this.accessor.set(req);
      next();
   }
}

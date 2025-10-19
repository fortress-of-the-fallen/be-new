import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { IHttpContextAccessor } from 'src/application/interface/http/i-http-context-accessor';

@Injectable()
export class HttpContextAccessor implements IHttpContextAccessor {
   private readonly storage = new AsyncLocalStorage<any>();

   get<T = any>(): T | undefined {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.storage.getStore();
   }

   set<T = any>(context: T): void {
      this.storage.enterWith(context);
   }

   clear(): void {
      this.storage.disable();
   }
}

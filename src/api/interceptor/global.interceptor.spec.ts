import { lastValueFrom, of } from 'rxjs';
import { GlobalInterceptor } from './global.interceptor';

describe('GlobalInterceptor', () => {
   it('passes through to the next handler', async () => {
      const interceptor = new GlobalInterceptor();
      const context = {} as any;
      const next = {
         handle: jest.fn().mockReturnValue(of({ ok: true })),
      };

      const result = await lastValueFrom(interceptor.intercept(context, next as any));

      expect(next.handle).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
   });
});

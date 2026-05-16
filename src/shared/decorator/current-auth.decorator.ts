import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestAuthContext } from 'src/shared/services/auth/auth-context';

export const CurrentAuth = createParamDecorator(
   (_data: unknown, ctx: ExecutionContext): RequestAuthContext | undefined => {
      const request = ctx.switchToHttp().getRequest();
      return request.authContext as RequestAuthContext | undefined;
   },
);

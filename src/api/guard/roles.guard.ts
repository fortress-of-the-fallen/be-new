import {
   Injectable,
   CanActivate,
   ExecutionContext,
   ForbiddenException,
   UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/shared/constant/roles.constant';
import { RoleBase } from 'src/features/auth/application/role-base.enum';
import { SessionContextService } from 'src/infrastructure/persistence/session-context.service';
import { extractRequestToken } from 'src/shared/helper/request-auth.helper';

@Injectable()
export class RolesGuard implements CanActivate {
   constructor(
      private reflector: Reflector,
      private readonly sessionContextService: SessionContextService,
   ) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const methodRoles = this.reflector.get<RoleBase[]>(ROLES_KEY, context.getHandler());
      const classRoles = this.reflector.get<RoleBase[]>(ROLES_KEY, context.getClass());

      const requiredRoles = [...(methodRoles ?? []), ...(classRoles ?? [])];

      if (!requiredRoles || requiredRoles.length === 0) {
         return true;
      }

      const request = context.switchToHttp().getRequest();
      const sessionId = extractRequestToken(request.headers as Record<string, unknown>);

      if (!sessionId) {
         throw new UnauthorizedException('Unauthorized');
      }

      const authContext = await this.sessionContextService.resolveAuthContext(sessionId);
      if (!authContext) {
         throw new UnauthorizedException('Unauthorized');
      }

      const matched = requiredRoles.some(role => authContext.roles.includes(role));
      if (!matched) throw new ForbiddenException('Access denied');

      request.authContext = authContext;
      return true;
   }
}

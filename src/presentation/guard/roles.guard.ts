import {
   Injectable,
   CanActivate,
   ExecutionContext,
   ForbiddenException,
   Inject,
   UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/domain/entity/user.entity';
import { ROLES_KEY } from 'src/domain/constant/roles.constant';
import { IBaseWriteUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-write.unit-of-work';
import { Session } from 'src/domain/entity/session.entity';
import { RoleBase } from 'src/domain/enum/role-base.enum';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { ICacheManager } from 'src/application/interface/cache-manager/i-cache-manager';

@Injectable()
export class RolesGuard implements CanActivate {
   constructor(
      private reflector: Reflector,

      @Inject(IBaseWriteUnitOfWork)
      private readonly unitOfWork: IBaseWriteUnitOfWork,

      @Inject(ICacheManager)
      private readonly cacheManager: ICacheManager,

      @Inject(ILogger)
      private readonly logger: ILogger,
   ) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const methodRoles = this.reflector.get<RoleBase[]>(ROLES_KEY, context.getHandler());
      const classRoles = this.reflector.get<RoleBase[]>(ROLES_KEY, context.getClass());

      const requiredRoles = [...(methodRoles ?? []), ...(classRoles ?? [])];

      if (!requiredRoles || requiredRoles.length === 0) {
         return true;
      }

      const request = context.switchToHttp().getRequest();
      const sessionId = request.headers['session-id'];

      if (!sessionId) {
         throw new UnauthorizedException('Unauthorized');
      }

      let session: Session | null = await this.cacheManager.get<Session>(sessionId);
      if (!session) {
         session = await this.unitOfWork
            .getRepository<Session>(Session.name)
            .queryCondition({ _id: sessionId })
            .join({ path: 'user', select: 'role' })
            .exec()
            .then(sessions => sessions[0] ?? null);

         if (!session) throw new ForbiddenException('Session not found');
         await this.cacheManager.set<Session>(sessionId, session, 15 * 60);
      }

      const userRoles: RoleBase[] = (session.user as User).role;

      const matched = requiredRoles.some(role => userRoles.includes(role));
      if (!matched) throw new ForbiddenException('Access denied');

      await this.cacheManager.expire(sessionId, 15 * 60);
      return true;
   }
}

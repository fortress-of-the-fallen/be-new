import {
   Injectable,
   CanActivate,
   ExecutionContext,
   ForbiddenException,
   UnauthorizedException,
   Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/shared/constant/roles.constant';
import { RoleBase } from 'src/features/auth/application/role-base.enum';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import Redis from 'ioredis';

type CachedAuthSession = {
   userId: string;
   roles: RoleBase[];
};

@Injectable()
export class RolesGuard implements CanActivate {
   constructor(
      private reflector: Reflector,

      private readonly prisma: PrismaService,

      @Inject('REDIS_CLIENT') private readonly redis: Redis,
   ) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const methodRoles = this.reflector.get<RoleBase[]>(ROLES_KEY, context.getHandler());
      const classRoles = this.reflector.get<RoleBase[]>(ROLES_KEY, context.getClass());

      const requiredRoles = [...(methodRoles ?? []), ...(classRoles ?? [])];

      if (!requiredRoles || requiredRoles.length === 0) {
         return true;
      }

      const request = context.switchToHttp().getRequest();
      const rawSessionId = request.headers['session-id'];
      const sessionId = typeof rawSessionId === 'string' ? rawSessionId : undefined;

      if (!sessionId) {
         throw new UnauthorizedException('Unauthorized');
      }

      const cachedSession = await this.redis.get(sessionId);
      let session = cachedSession ? (JSON.parse(cachedSession) as CachedAuthSession) : null;
      if (!session || !session.roles || session.roles.length === 0) {
         const dbSession = await this.prisma.session.findFirst({
            where: {
               id: sessionId,
               isRevoked: false,
               expiresAt: {
                  gt: new Date(),
               },
            },
            include: {
               account: {
                  select: {
                     id: true,
                     role: true,
                  },
               },
            },
         });

         if (!dbSession || !dbSession.account) {
            throw new ForbiddenException('Session not found');
         }

         session = {
            userId: dbSession.account.id as string,
            roles: (dbSession.account.role as RoleBase[]) ?? [],
         };
         await this.redis.set(sessionId, JSON.stringify(session), 'EX', 15 * 60);
      }

      const matched = requiredRoles.some(role => session.roles.includes(role));
      if (!matched) throw new ForbiddenException('Access denied');

      await this.redis.expire(sessionId, 15 * 60);
      return true;
   }
}

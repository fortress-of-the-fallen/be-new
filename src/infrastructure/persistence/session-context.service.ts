import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { HashHelper } from 'src/shared/helper/hash.helper';
import { RoleBase } from 'src/features/auth/application/role-base.enum';
import { AccessTokenService } from 'src/shared/services/auth/access-token.service';
import { RequestAuthContext } from 'src/shared/services/auth/auth-context';

type PrismaDbClient = any;

@Injectable()
export class SessionContextService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly accessTokenService: AccessTokenService,
   ) {}

   async findActiveSessionByToken(
      sessionToken?: string,
      db: PrismaDbClient = this.prisma,
   ) {
      if (!sessionToken) {
         return null;
      }

      const accessClaims = this.accessTokenService.verify(sessionToken);
      if (accessClaims) {
         const session = await db.session.findFirst({
            where: {
               id: accessClaims.sid,
               expiresAt: {
                  gt: new Date(),
               },
            },
            include: {
               account: {
                  select: {
                     id: true,
                     username: true,
                     playerId: true,
                     role: true,
                     status: true,
                     maxSession: true,
                  },
               },
            },
         });

         if (
            !session ||
            session.revokedAt ||
            !session.account ||
            session.account.id !== accessClaims.sub ||
            session.playerId !== accessClaims.playerId
         ) {
            return null;
         }

         return session;
      }

      const session = await db.session.findFirst({
         where: {
            tokenHash: HashHelper.hashString(sessionToken),
            expiresAt: {
               gt: new Date(),
            },
         },
         include: {
            account: {
               select: {
                  id: true,
                  username: true,
                  playerId: true,
                  role: true,
                  status: true,
                  maxSession: true,
               },
            },
         },
      });

      if (!session || session.revokedAt) {
         return null;
      }

      return session;
   }

   async resolveAuthContext(
      sessionToken?: string,
      db: PrismaDbClient = this.prisma,
   ): Promise<RequestAuthContext | null> {
      const session = await this.findActiveSessionByToken(sessionToken, db);
      if (!session || !session.account || session.account.status !== 'active' || !session.playerId) {
         return null;
      }

      return {
         accountId: session.account.id as string,
         playerId: session.playerId,
         username: session.account.username as string,
         roles: ((session.account.role as RoleBase[]) ?? []) as RoleBase[],
         sessionId: session.id as string,
      };
   }

   async resolveUserId(sessionToken?: string): Promise<string | null> {
      const session = await this.findActiveSessionByToken(sessionToken);
      if (!session) {
         return null;
      }

      return session.user ?? null;
   }

   async resolvePlayerId(sessionToken?: string): Promise<string | null> {
      const session = await this.findActiveSessionByToken(sessionToken);
      if (!session) {
         return null;
      }

      return session.playerId ?? session.account?.playerId ?? null;
   }
}

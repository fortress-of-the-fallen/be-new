import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { HashHelper } from 'src/shared/helper/hash.helper';
import { PlayerStateService } from 'src/infrastructure/persistence/player-state.service';
import { AuthAccount } from './auth-account.entity';

@Injectable()
export class AuthPrismaRepository {
   constructor(
      private readonly prisma: PrismaService,
      private readonly playerStateService: PlayerStateService,
   ) {}

   async findByUsername(username: string): Promise<AuthAccount | null> {
      const user = await this.prisma.user.findFirst({
         where: { username },
         include: {
            player: {
               select: {
                  profile: true,
               },
            },
         },
      });

      if (!user || !user.username || !user.password) {
         return null;
      }

      return new AuthAccount(
         user.id,
         user.username,
         user.password,
         user.playerId ?? null,
         String((user.player?.profile as Record<string, unknown> | undefined)?.displayName ?? user.username),
         user.status,
         user.role,
      );
   }

   async existsByUsername(username: string): Promise<boolean> {
      const count = await this.prisma.user.count({ where: { username } });
      return count > 0;
   }

   async createAccount(payload: {
      username: string;
      passwordHash: string;
      roles: string[];
      displayName?: string;
      refreshToken: string;
      expiresAt: Date;
      userAgent?: string;
      ipAddress?: string;
   }): Promise<{ accountId: string; playerId: string; username: string; displayName: string; sessionId: string }> {
      return this.prisma.$transaction(async tx => {
         const account = await tx.user.create({
            data: {
               username: payload.username,
               password: payload.passwordHash,
               role: payload.roles,
            },
         });

         const { playerId } = await this.playerStateService.bootstrapNewPlayer(tx, {
            accountId: account.id,
            username: payload.username,
            displayName: payload.displayName,
         });

         const session = await tx.session.create({
            data: {
               user: account.id,
               playerId,
               tokenHash: HashHelper.hashString(payload.refreshToken),
               expiresAt: payload.expiresAt,
               userAgent: payload.userAgent,
               ipAddress: payload.ipAddress,
            },
         });

         return {
            accountId: account.id,
            playerId,
            username: account.username,
            displayName: payload.displayName?.trim() || payload.username,
            sessionId: session.id,
         };
      });
   }

   async createSession(payload: {
      refreshToken: string;
      userId: string;
      playerId: string;
      expiresAt: Date;
      userAgent?: string;
      ipAddress?: string;
   }): Promise<{ sessionId: string }> {
      const session = await this.prisma.session.create({
         data: {
            user: payload.userId,
            playerId: payload.playerId,
            tokenHash: HashHelper.hashString(payload.refreshToken),
            expiresAt: payload.expiresAt,
            userAgent: payload.userAgent,
            ipAddress: payload.ipAddress,
         },
      });

      return {
         sessionId: session.id,
      };
   }

   async findRefreshSession(refreshToken: string) {
      const session = await this.prisma.session.findFirst({
         where: {
            tokenHash: HashHelper.hashString(refreshToken),
            expiresAt: {
               gt: new Date(),
            },
         },
         include: {
            account: {
               include: {
                  player: {
                     select: {
                        profile: true,
                     },
                  },
               },
            },
         },
      });

      if (!session || session.revokedAt) {
         return null;
      }

      return session;
   }

   async findSessionByDatabaseId(sessionId: string) {
      const session = await this.prisma.session.findUnique({
         where: {
            id: sessionId,
         },
         include: {
            account: true,
         },
      });

      if (!session || session.revokedAt || session.expiresAt <= new Date()) {
         return null;
      }

      return session;
   }

   async revokeSessionById(sessionId: string): Promise<void> {
      await this.prisma.session.update({
         where: {
            id: sessionId,
         },
         data: {
            revokedAt: new Date(),
         },
      });
   }

   async updateProfileDisplayName(playerId: string, displayName: string): Promise<void> {
      const prismaClient = this.prisma as any;

      const player = await prismaClient.player.findUnique({
         where: {
            id: playerId,
         },
      });

      if (!player) {
         return;
      }

      const profile = ((player.profile as Record<string, unknown>) ?? {}) as Record<string, unknown>;
      profile.displayName = displayName;

      await prismaClient.player.update({
         where: {
            id: playerId,
         },
         data: {
            profile,
         },
      });
   }

   async updateLastLoginAt(userId: string): Promise<void> {
      await this.prisma.user.update({
         where: {
            id: userId,
         },
         data: {
            lastLoginAt: new Date(),
         },
      });
   }
}

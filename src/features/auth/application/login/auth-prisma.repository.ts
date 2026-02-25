import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { AuthAccount } from './auth-account.entity';
import { AuthSession } from './auth-session.entity';

@Injectable()
export class AuthPrismaRepository {
   constructor(private readonly prisma: PrismaService) {}

   async findByUsername(username: string): Promise<AuthAccount | null> {
      const user = await this.prisma.user.findFirst({
         where: { username },
      });

      if (!user || !user.username || !user.email || !user.password) {
         return null;
      }

      return new AuthAccount(
         user.id,
         user.username,
         user.email,
         user.password,
         user.role,
         user.maxSession,
         user.isDeleted,
         user.isLocked,
      );
   }

   async existsByUsername(username: string): Promise<boolean> {
      const count = await this.prisma.user.count({ where: { username } });
      return count > 0;
   }

   async existsByEmail(email: string): Promise<boolean> {
      const count = await this.prisma.user.count({ where: { email } });
      return count > 0;
   }

   async createUser(payload: {
      id: string;
      username: string;
      email: string;
      passwordHash: string;
      roles: string[];
   }): Promise<void> {
      await this.prisma.user.create({
         data: {
            id: payload.id,
            username: payload.username,
            email: payload.email,
            password: payload.passwordHash,
            role: payload.roles,
         },
      });
   }

   async countSessionsByUserId(userId: string): Promise<number> {
      return this.prisma.session.count({
         where: {
            user: userId,
         },
      });
   }

   async createSession(payload: {
      id: string;
      userId: string;
      expiresAt: Date;
      userAgent?: string;
      ipAddress?: string;
   }): Promise<void> {
      await this.prisma.session.create({
         data: {
            id: payload.id,
            user: payload.userId,
            expiresAt: payload.expiresAt,
            userAgent: payload.userAgent,
            ipAddress: payload.ipAddress,
         },
      });
   }

   async findSessionById(sessionId: string): Promise<AuthSession | null> {
      const session = await this.prisma.session.findUnique({
         where: {
            id: sessionId,
         },
      });

      if (!session) {
         return null;
      }

      return new AuthSession(session.id, session.user, session.expiresAt, session.isRevoked);
   }

   async deleteSessionById(sessionId: string): Promise<void> {
      await this.prisma.session.delete({
         where: {
            id: sessionId,
         },
      });
   }
}

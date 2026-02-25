import { Module } from '@nestjs/common';
import { CacheModule } from './cache-manager/cache-module';
import { FileServiceModule } from './file-service/file-service.module';
import { MailServiceModule } from './mail-service/mail-service.module';
import { BackgroundHandlerModule } from './background-handler/background-handler.module';
import { BroadcastModule } from './broadcast-handler/broadcast.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from 'src/features/auth/auth.module';
import { CharacterModule } from 'src/features/character/character.module';
import { SeedingModule } from './persistence/seeding/seeding.module';

const dependencies = [
   CacheModule,
   FileServiceModule,
   MailServiceModule,
   BackgroundHandlerModule,
   BroadcastModule,
   PrismaModule,
   SeedingModule,
   AuthModule,
   CharacterModule,
];

@Module({
   imports: dependencies,
   exports: dependencies,
})
export class InfrastructureModule {}

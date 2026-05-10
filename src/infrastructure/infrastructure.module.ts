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
import { PersistenceModule } from './persistence/persistence.module';
import { PlayerModule } from 'src/features/player/player.module';
import { ConfigModule } from 'src/features/config/config.module';
import { LeaderboardModule } from 'src/features/leaderboard/leaderboard.module';
import { FormationModule } from 'src/features/formation/formation.module';
import { QuestModule } from 'src/features/quest/quest.module';
import { InventoryModule } from 'src/features/inventory/inventory.module';
import { BattleModule } from 'src/features/battle/battle.module';
import { LobbyModule } from 'src/features/lobby/lobby.module';

const dependencies = [
   CacheModule,
   FileServiceModule,
   MailServiceModule,
   BackgroundHandlerModule,
   BroadcastModule,
   PrismaModule,
   PersistenceModule,
   SeedingModule,
   AuthModule,
   CharacterModule,
   PlayerModule,
   ConfigModule,
   LeaderboardModule,
   FormationModule,
   QuestModule,
   InventoryModule,
   BattleModule,
   LobbyModule,
];

@Module({
   imports: dependencies,
   exports: dependencies,
})
export class InfrastructureModule {}

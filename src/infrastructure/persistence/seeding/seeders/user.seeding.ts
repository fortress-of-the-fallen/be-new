import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ConfigKeyConstant } from 'src/shared/constant/configkey.constant';
import { Seeder } from 'src/shared/decorator/seeder.decorator';
import { RoleBase } from 'src/features/auth/application/role-base.enum';
import { HashHelper } from 'src/shared/helper/hash.helper';
import { PlayerStateService } from 'src/infrastructure/persistence/player-state.service';

@Seeder()
@Injectable()
export class UserSeeding {
   constructor(
      private readonly prisma: PrismaService,
      private readonly playerStateService: PlayerStateService,
   ) {}

   async seed() {
      const admin = await this.prisma.user.findFirst({
         where: {
            username: 'admin',
         },
      });

      if (!admin) {
         await this.prisma.$transaction(async tx => {
            const account = await tx.user.create({
               data: {
                  username: 'admin',
                  password: HashHelper.hashString(ConfigKeyConstant.AppAdminPassword),
                  role: [RoleBase.Admin],
                  maxSession: -1,
               },
            });

            await this.playerStateService.bootstrapNewPlayer(tx, {
               accountId: account.id,
               username: account.username,
               displayName: 'Admin',
            });
         });
         return;
      }

      if (!admin.playerId) {
         await this.prisma.$transaction(async tx => {
            await this.playerStateService.bootstrapNewPlayer(tx, {
               accountId: admin.id,
               username: admin.username,
               displayName: 'Admin',
            });

            await tx.user.update({
               where: {
                  id: admin.id,
               },
               data: {
                  password: HashHelper.hashString(ConfigKeyConstant.AppAdminPassword),
                  role: [RoleBase.Admin],
                  maxSession: -1,
                  status: 'active',
               },
            });
         });
         return;
      }

      await this.prisma.user.update({
         where: {
            id: admin.id,
         },
         data: {
            password: HashHelper.hashString(ConfigKeyConstant.AppAdminPassword),
            role: [RoleBase.Admin],
            maxSession: -1,
            status: 'active',
         },
      });
   }
}

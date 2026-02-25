import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ConfigKeyConstant } from 'src/shared/constant/configkey.constant';
import { Seeder } from 'src/shared/decorator/seeder.decorator';
import { RoleBase } from 'src/features/auth/application/role-base.enum';
import { HashHelper } from 'src/shared/helper/hash.helper';

@Seeder()
@Injectable()
export class UserSeeding {
   constructor(private readonly prisma: PrismaService) {}

   async seed() {
      const userId = '5575e0ab-dddf-46ab-b6ac-14c0aba40144';

      const exist = await this.prisma.user.count({
         where: {
            id: userId,
            isDeleted: false,
            isLocked: false,
         },
      });

      if (exist === 0) {
         await this.prisma.user.create({
            data: {
               id: userId,
               username: 'admin',
               password: HashHelper.hashString(ConfigKeyConstant.AppAdminPassword),
               role: [RoleBase.Admin],
               maxSession: -1,
            },
         });
      }
   }
}

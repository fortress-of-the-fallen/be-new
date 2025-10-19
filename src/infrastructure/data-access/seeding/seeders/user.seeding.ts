import { Inject } from '@nestjs/common';
import { IBaseWriteUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-write.unit-of-work';
import { ConfigKeyConstant } from 'src/domain/constant/configkey.constant';
import { Seeder } from 'src/domain/decorator/seeder.decorator';
import { User } from 'src/domain/entity/user.entity';
import { RoleBase } from 'src/domain/enum/role-base.enum';
import { HashHelper } from 'src/domain/helper/hash.helper';

@Seeder()
export class UserSeeding {
   constructor(
      @Inject(IBaseWriteUnitOfWork)
      private readonly unitOfWork: IBaseWriteUnitOfWork,
   ) {}

   async seed() {
      const userId = '5575e0ab-dddf-46ab-b6ac-14c0aba40144';

      const exist = await this.unitOfWork.getRepository<User>(User.name).any({ _id: userId });

      if (!exist) {
         await this.unitOfWork.getRepository<User>(User.name).add({
            _id: userId,
            username: 'admin',
            password: HashHelper.hashString(ConfigKeyConstant.AppAdminPassword),
            role: [RoleBase.Admin],
            maxSession: -1,
         });

         await this.unitOfWork.saveChanges();
      }
   }
}

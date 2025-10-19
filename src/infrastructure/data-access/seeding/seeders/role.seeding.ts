import { Inject } from '@nestjs/common';
import { IUniWriteUnitOfWork } from 'src/application/interface/data-access/uni-data-access/unit-of-work/i-write.unit-of-work';
import { Seeder } from 'src/domain/decorator/seeder.decorator';

const roles = [
   {
      id: '31c0711b-25c7-4a64-aee0-5b08cba13475',
      title: 'admin',
      level: 1,
   },
   {
      id: '43772980-a6b3-4eb5-b83f-14326f96d63c',
      title: 'user',
      level: 2,
   },
];

@Seeder()
export class RoleSeeder {
   constructor(
      @Inject(IUniWriteUnitOfWork)
      private readonly writeUnitOfWork: IUniWriteUnitOfWork,
   ) {}

   async seed() {
      // Seeding logic for roles
   }
}

import { Injectable } from '@nestjs/common';
import { Seeder } from 'src/shared/decorator/seeder.decorator';

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
@Injectable()
export class RoleSeeder {
   async seed() {
      void roles;
   }
}

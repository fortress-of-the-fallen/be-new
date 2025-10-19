import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigKeyConstant } from 'src/domain/constant/configkey.constant';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import * as fs from 'fs';
import * as path from 'path';
import { SeedingModule } from '../seeding/seeding.module';
import { IUniReadUnitOfWork } from 'src/application/interface/data-access/uni-data-access/unit-of-work/i-read.unit-of-work';
import { WriteUnitOfWork } from './unit-of-work/write.unit-of-work';
import { ReadUnitOfWork } from './unit-of-work/read.unit-of-work';
import { IUniWriteUnitOfWork } from 'src/application/interface/data-access/uni-data-access/unit-of-work/i-write.unit-of-work';
import { entities } from 'src/domain/decorator/uni-entity.decorator';

const entityDir = path.resolve(__dirname, '../../../domain/uni-entity');

fs.readdirSync(entityDir)
   .filter(file => file.endsWith('.js'))
   .forEach(file => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(path.join(entityDir, file));
   });

@Module({
   imports: [
      MongooseModule.forRoot(`${ConfigKeyConstant.DateBase.ConnectionUrl}?authSource=admin`, {
         dbName: ConfigKeyConstant.DateBase.UniversalDbName,
         connectionName: 'uniConnection',
      }),
      MongooseModule.forFeature(entities, 'uniConnection'),
      forwardRef(() => InfrastructureModule),
      SeedingModule,
   ],
   providers: [
      {
         provide: IUniWriteUnitOfWork,
         useClass: WriteUnitOfWork,
      },
      {
         provide: IUniReadUnitOfWork,
         useClass: ReadUnitOfWork,
      },
   ],
   exports: [MongooseModule, IUniWriteUnitOfWork, IUniReadUnitOfWork],
})
export class UniDataAccessModule {}

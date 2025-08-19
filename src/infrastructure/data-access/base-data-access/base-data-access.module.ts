import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IBaseWriteUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-write.unit-of-work';
import { ConfigKeyConstant } from 'src/domain/constant/configkey.constant';
import { WriteUnitOfWork } from './unit-of-work/write.unit-of-work';
import { IBaseReadUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-read.unit-of-work';
import { ReadUnitOfWork } from './unit-of-work/read.unit-of-work';
import { entities } from 'src/domain/decorator/entity.decorator';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import * as fs from 'fs';
import * as path from 'path';
import { SeedingModule } from '../seeding/seeding.module';

const entityDir = path.resolve(__dirname, '../../../domain/entity');

fs.readdirSync(entityDir)
   .filter(file => file.endsWith('.js'))
   .forEach(file => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(path.join(entityDir, file));
   });

@Module({
   imports: [
      MongooseModule.forRoot(`${ConfigKeyConstant.DateBase.ConnectionUrl}?authSource=admin`, {
         dbName: ConfigKeyConstant.DateBase.BaseDbName,
      }),
      MongooseModule.forFeature(entities),
      forwardRef(() => InfrastructureModule),
      SeedingModule,
   ],
   providers: [
      {
         provide: IBaseWriteUnitOfWork,
         useClass: WriteUnitOfWork,
      },
      {
         provide: IBaseReadUnitOfWork,
         useClass: ReadUnitOfWork,
      },
   ],
   exports: [MongooseModule, IBaseWriteUnitOfWork, IBaseReadUnitOfWork],
})
export class BaseDataAccessModule {}

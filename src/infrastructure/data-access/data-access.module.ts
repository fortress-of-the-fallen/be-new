import { Module } from '@nestjs/common';
import { UniDataAccessModule } from './uni-data-access/uni-data-access.module';
import { BaseDataAccessModule } from './base-data-access/base-data-access.module';

@Module({
   imports: [BaseDataAccessModule, UniDataAccessModule],
   exports: [BaseDataAccessModule, UniDataAccessModule],
})
export class DataAccessModule {}

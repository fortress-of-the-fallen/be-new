import { Inject } from '@nestjs/common';
import { IJob } from 'src/application/interface/background-handler/i-job';
import { IBaseWriteUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-write.unit-of-work';
import { IFileService } from 'src/application/interface/file-service/i-file-service';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { entities } from 'src/domain/decorator/entity.decorator';
import { Job } from 'src/domain/decorator/job.decorator';
import { BackupEntity } from 'src/domain/entity/back-up.entity';
import { getEnum } from 'src/domain/enum/back-up.enum';
import { TimeHelper } from 'src/domain/helper/time.helper';

@Job()
export class DatabaseBackupJob implements IJob {
   constructor(
      @Inject(ILogger)
      private readonly logger: ILogger,

      @Inject(IBaseWriteUnitOfWork)
      private readonly baseWriteUnitOfWork: IBaseWriteUnitOfWork,

      @Inject(IFileService)
      private readonly fileService: IFileService,
   ) {
      this.logger.setContext(DatabaseBackupJob.name);
   }
   cron: string = '0 0 * * *';
   execute: () => Promise<void> = async () => {
      const backUpRepo = this.baseWriteUnitOfWork.getRepository<BackupEntity>(BackupEntity.name);

      const baseEntities = entities;

      for (const entity of baseEntities) {
         const backUpEnum = getEnum(entity.name);
         if (backUpEnum) {
            if (await backUpRepo.any({ createAt: TimeHelper.getToday(), backUpType: backUpEnum })) {
               this.logger.warn('Backup already exists for today.');
               continue;
            }

            const repo = this.baseWriteUnitOfWork.getRepository<any>(entity.name);
            const data = await repo.getBackupData();

            const fileBuffer = this.convertDataToFileBuffer(data);
            const BackUpFile = await this.fileService.uploadFile(
               fileBuffer,
               `backup-${entity.name}.json`,
               'database-backups',
            );

            await backUpRepo.add({
               backUpType: backUpEnum,
               filePath: BackUpFile,
               createAt: TimeHelper.getToday(),
            });

            await this.baseWriteUnitOfWork.saveChanges();
            this.logger.log(`Backing up entities... ${fileBuffer.length} bytes`);
         }
      }
   };

   private convertDataToFileBuffer(data: any[]): Buffer {
      const jsonString = JSON.stringify(data, null, 2);
      return Buffer.from(jsonString, 'utf-8');
   }
}

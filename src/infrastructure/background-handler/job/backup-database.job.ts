import { Logger } from '@nestjs/common';
import { FileService } from 'src/infrastructure/file-service/file-service';
import { Job } from 'src/shared/decorator/job.decorator';
import { BackUpEnum } from 'src/infrastructure/background-handler/job/back-up.enum';
import { TimeHelper } from 'src/shared/helper/time.helper';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Job()
export class DatabaseBackupJob {
   private readonly logger = new Logger(DatabaseBackupJob.name);

   constructor(
      private readonly prisma: PrismaService,
      private readonly fileService: FileService,
   ) {}
   cron: string = '0 0 * * *';
   execute: () => Promise<void> = async () => {
      const backupTargets: Array<{
         type: BackUpEnum;
         fileName: string;
         getData: () => Promise<any[]>;
      }> = [
         {
            type: BackUpEnum.User,
            fileName: 'backup-User.json',
            getData: () => this.prisma.user.findMany(),
         },
         {
            type: BackUpEnum.Session,
            fileName: 'backup-Session.json',
            getData: () => this.prisma.session.findMany(),
         },
      ];

      for (const target of backupTargets) {
         const exists = await this.prisma.backup.count({
            where: {
               backUpType: target.type,
               createAt: TimeHelper.getToday(),
            },
         });
         if (exists > 0) {
            this.logger.warn(`Backup already exists for today: ${target.type}`);
            continue;
         }

         const data = await target.getData();
         const fileBuffer = this.convertDataToFileBuffer(data);
         const backUpFile = await this.fileService.uploadFile(
            fileBuffer,
            target.fileName,
            'database-backups',
         );

         await this.prisma.backup.create({
            data: {
               backUpType: target.type,
               filePath: backUpFile,
               createAt: TimeHelper.getToday(),
            },
         });

         this.logger.log(`Backing up ${target.type}... ${fileBuffer.length} bytes`);
      }
   };

   private convertDataToFileBuffer(data: any[]): Buffer {
      const jsonString = JSON.stringify(data, null, 2);
      return Buffer.from(jsonString, 'utf-8');
   }
}

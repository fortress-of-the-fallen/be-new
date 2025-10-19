import { Module, Scope } from '@nestjs/common';
import { FileService } from './file-service';
import { MinioConfig } from './minio.config';
import { IFileService } from 'src/application/interface/file-service/i-file-service';

@Module({
   providers: [
      MinioConfig,
      {
         provide: IFileService,
         useClass: FileService,
         scope: Scope.REQUEST,
      },
   ],
   exports: [IFileService],
})
export class FileServiceModule {}

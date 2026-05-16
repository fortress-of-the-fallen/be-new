import { Module, Scope } from '@nestjs/common';
import { FileService } from './file-service';
import { MinioConfig } from './minio.config';

@Module({
   providers: [
      MinioConfig,
      {
         provide: FileService,
         useClass: FileService,
         scope: Scope.REQUEST,
      },
   ],
   exports: [FileService],
})
export class FileServiceModule {}

import { Inject } from '@nestjs/common';
import { IBackgroundHandler } from 'src/application/interface/background-handler/i-background-handler';
import { IFileService } from 'src/application/interface/file-service/i-file-service';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { Seeder } from 'src/domain/decorator/seeder.decorator';
import { IdentityHelper } from 'src/domain/helper/identity.helper';

@Seeder()
export class FileSeeding {
   constructor(
      @Inject(IFileService)
      private readonly fileService: IFileService,

      @Inject(IBackgroundHandler)
      private readonly backgroundHandler: IBackgroundHandler,

      @Inject(ILogger)
      private readonly logger: ILogger,
   ) {
      this.logger.setContext(FileSeeding.name);
   }

   async seed() {
      // this.backgroundHandler.defineJobs('fileCleanup', async job => {
      //    this.logger.setContext(IdentityHelper.generateUUID());
      //    this.logger.log('Starting file cleanup job');
      // });
      // await this.backgroundHandler.start();
      // const jobs = await this.backgroundHandler.getJobsByName('fileCleanup');
      // await this.backgroundHandler.scheduleJob('fileCleanup', '3 seconds');
   }
}

import { Logger } from '@nestjs/common';
import { AgendaBackgroundHandler } from 'src/infrastructure/background-handler/background-handler';
import { FileService } from 'src/infrastructure/file-service/file-service';
import { Seeder } from 'src/shared/decorator/seeder.decorator';

@Seeder()
export class FileSeeding {
   private readonly logger = new Logger(FileSeeding.name);

   constructor(
      private readonly fileService: FileService,
      private readonly backgroundHandler: AgendaBackgroundHandler,
   ) {}

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

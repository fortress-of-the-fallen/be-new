import { Module } from '@nestjs/common';
import { ConfigKeyConstant } from 'src/shared/constant/configkey.constant';
import { AgendaBackgroundHandler } from './background-handler';
import Agenda from 'agenda';
import * as fs from 'fs';
import * as path from 'path';

function buildMongoAgendaUrl(): string {
   const url = new URL(ConfigKeyConstant.DateBase.ConnectionUrl);
   url.pathname = `/${ConfigKeyConstant.DateBase.BackgoundHanlderDbName}`;
   if (!url.searchParams.get('authSource')) {
      url.searchParams.set('authSource', 'admin');
   }

   return url.toString();
}
import { jobs } from 'src/shared/decorator/job.decorator';
import { JobSchedulerService } from './job/job-scheduler.job';
import { PersistenceModule } from '../persistence/persistence.module';
import { FileServiceModule } from '../file-service/file-service.module';

const jobDir = path.resolve(__dirname, './job');

fs.readdirSync(jobDir)
   .filter(file => file.endsWith('.js'))
   .forEach(file => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(path.join(jobDir, file));
   });

const agendaProvider = {
   provide: 'AGENDA_TOKEN',
   useFactory: async () => {
      const agenda = new Agenda({
         db: {
            address: buildMongoAgendaUrl(),
         },
      });
      return agenda;
   },
};

@Module({
   imports: [PersistenceModule, FileServiceModule],
   providers: [agendaProvider, AgendaBackgroundHandler, ...jobs, JobSchedulerService],
   exports: [AgendaBackgroundHandler, ...jobs],
})
export class BackgroundHandlerModule {}

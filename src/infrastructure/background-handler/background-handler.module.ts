import { forwardRef, Module } from '@nestjs/common';
import { ConfigKeyConstant } from 'src/domain/constant/configkey.constant';
import { AgendaBackgroundHandler } from './background-handler';
import { InfrastructureModule } from '../infrastructure.module';
import { IBackgroundHandler } from 'src/application/interface/background-handler/i-background-handler';
import Agenda from 'agenda';
import * as fs from 'fs';
import * as path from 'path';
import { jobs } from 'src/domain/decorator/job.decorator';
import { JobSchedulerService } from './job/job-scheduler.job';

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
            address: `${ConfigKeyConstant.DateBase.ConnectionUrl}/${ConfigKeyConstant.DateBase.BackgoundHanlderDbName}?authSource=admin`,
         },
      });
      return agenda;
   },
};

@Module({
   imports: [forwardRef(() => InfrastructureModule)],
   providers: [
      agendaProvider,
      {
         provide: IBackgroundHandler,
         useClass: AgendaBackgroundHandler,
      },
      ...jobs,
      JobSchedulerService,
   ],
   exports: [IBackgroundHandler, ...jobs],
})
export class BackgroundHandlerModule {}

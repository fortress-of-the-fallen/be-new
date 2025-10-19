import { Inject, Injectable } from '@nestjs/common';
import Agenda, { Job } from 'agenda';
import { IBackgroundHandler } from 'src/application/interface/background-handler/i-background-handler';
import { ILogger } from 'src/application/interface/logger/i-logger';

@Injectable()
export class AgendaBackgroundHandler implements IBackgroundHandler {
   constructor(
      @Inject('AGENDA_TOKEN')
      private readonly agenda: Agenda,

      @Inject(ILogger)
      private readonly logger: ILogger,
   ) {
      this.logger.setContext(AgendaBackgroundHandler.name);
   }
   async start(): Promise<void> {
      await this.agenda.start();
   }

   defineJobs(jobName: string, jobHandler: (job: any) => Promise<void>) {
      this.agenda.define(jobName, jobHandler as (job: Job) => Promise<void>);
   }

   async scheduleJob(name: string, interval: string, data?: any) {
      await this.agenda.cancel({ name });
      await this.agenda.every(interval, name, data);
   }

   async stopJob(jobName: string) {
      await this.agenda.cancel({ name: jobName });
   }

   async getJobsByName(name: string) {
      return await this.agenda.jobs({ name });
   }
}

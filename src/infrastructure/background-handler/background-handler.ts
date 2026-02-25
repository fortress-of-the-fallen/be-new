import { Inject, Injectable } from '@nestjs/common';
import Agenda, { Job } from 'agenda';

@Injectable()
export class AgendaBackgroundHandler {
   constructor(
      @Inject('AGENDA_TOKEN')
      private readonly agenda: Agenda,
   ) {}
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

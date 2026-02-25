import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Agenda from 'agenda';
import { jobs } from 'src/shared/decorator/job.decorator';

type JobContract = {
   cron: string;
   execute: () => Promise<void>;
};

@Injectable()
export class JobSchedulerService implements OnModuleInit {
   private readonly logger = new Logger(JobSchedulerService.name);

   constructor(
      private readonly moduleRef: ModuleRef,

      @Inject('AGENDA_TOKEN')
      private readonly agenda: Agenda,
   ) {}

   async onModuleInit() {
      this.logger.log('JobSchedulerService initialized');

      await this.agenda.start();

      for (const JobClass of jobs) {
         const jobInstance: JobContract = await this.moduleRef.resolve(JobClass, undefined, {
            strict: false,
         });

         this.agenda.define(JobClass.name, async () => {
            await jobInstance.execute();
         });

         await this.agenda.every(jobInstance.cron, JobClass.name);
         this.logger.log(`Scheduled job: ${JobClass.name} with cron: ${jobInstance.cron}`);
      }
   }
}

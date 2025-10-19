import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Agenda from 'agenda';
import { IJob } from 'src/application/interface/background-handler/i-job';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { jobs } from 'src/domain/decorator/job.decorator';

@Injectable()
export class JobSchedulerService implements OnModuleInit {
   constructor(
      private readonly moduleRef: ModuleRef,

      @Inject('AGENDA_TOKEN')
      private readonly agenda: Agenda,

      @Inject(ILogger)
      private readonly logger: ILogger,
   ) {
      this.logger.setContext(JobSchedulerService.name);
   }

   async onModuleInit() {
      this.logger.log('JobSchedulerService initialized');

      await this.agenda.start();

      for (const JobClass of jobs) {
         const jobInstance: IJob = await this.moduleRef.resolve(JobClass, undefined, {
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

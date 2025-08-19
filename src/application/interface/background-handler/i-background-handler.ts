export interface IBackgroundHandler {
   start(): Promise<void>;
   defineJobs(jobName: string, jobHandler: (job: any) => Promise<void>);
   scheduleJob(name: string, interval: string, data?: any);
   stopJob(jobName: string);
   getJobsByName(name: string);
}

export const IBackgroundHandler = Symbol('IBackgroundHandler');

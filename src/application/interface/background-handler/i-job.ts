export interface IJob {
   cron: string;
   execute: () => Promise<void>;
}

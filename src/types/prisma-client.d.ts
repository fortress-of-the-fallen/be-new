declare module '@prisma/client' {
   export class PrismaClient {
      constructor(options?: any);
      user: any;
      session: any;
      character: any;
      characterAppearance: any;
      characterStats: any;
      backup: any;
      $connect(): Promise<void>;
      $transaction(input: any): Promise<any>;
      $on(event: string, callback: (...args: any[]) => void): void;
   }
}

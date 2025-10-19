import { Inject, Injectable, Scope } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core/injector/module-ref';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { seeders } from 'src/domain/decorator/seeder.decorator';

@Injectable({ scope: Scope.TRANSIENT })
export class Seeding {
   private seedingQueue: Array<any> = seeders;

   constructor(
      @Inject(ILogger)
      private readonly logger: ILogger,
      private readonly moduleRef: ModuleRef,
   ) {
      logger.setContext(Seeding.name);
   }

   async seed() {
      for (const seeder of this.seedingQueue) {
         try {
            const seederInstance = await this.moduleRef.resolve(seeder);
            await seederInstance.seed();
            this.logger.log(`Seeding completed for: ${seeder.name}`);
         } catch (error) {
            this.logger.error(`Error seeding ${seeder.name}:`, error);
         }
      }
   }
}

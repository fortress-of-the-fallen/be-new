import { Injectable, Logger, Scope } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core/injector/module-ref';
import { seeders } from 'src/shared/decorator/seeder.decorator';

@Injectable({ scope: Scope.TRANSIENT })
export class Seeding {
   private seedingQueue: Array<any> = seeders;
   private readonly logger = new Logger(Seeding.name);

   constructor(private readonly moduleRef: ModuleRef) {}

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

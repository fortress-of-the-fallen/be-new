import { forwardRef, Module } from '@nestjs/common';
import { Seeding } from './seeding';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import * as fs from 'fs';
import * as path from 'path';
import { seeders } from 'src/domain/decorator/seeder.decorator';

const seedingDir = path.resolve(__dirname, './seeders');

fs.readdirSync(seedingDir)
   .filter(file => file.endsWith('.js'))
   .forEach(file => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(path.join(seedingDir, file));
   });

const seedings = [Seeding, ...seeders];

@Module({
   imports: [forwardRef(() => InfrastructureModule)],
   providers: seedings,
   exports: seedings,
})
export class SeedingModule {}

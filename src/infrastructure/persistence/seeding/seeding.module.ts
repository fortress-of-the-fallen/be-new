import { Module } from '@nestjs/common';
import { Seeding } from './seeding';
import * as fs from 'fs';
import * as path from 'path';
import { seeders } from 'src/shared/decorator/seeder.decorator';
import { PersistenceModule } from '../persistence.module';
import { FileServiceModule } from 'src/infrastructure/file-service/file-service.module';
import { BackgroundHandlerModule } from 'src/infrastructure/background-handler/background-handler.module';

const seedingDir = path.resolve(__dirname, './seeders');

fs.readdirSync(seedingDir)
   .filter(file => file.endsWith('.js'))
   .forEach(file => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(path.join(seedingDir, file));
   });

const seedings = [Seeding, ...seeders];

@Module({
   imports: [PersistenceModule, FileServiceModule, BackgroundHandlerModule],
   providers: seedings,
   exports: seedings,
})
export class SeedingModule {}

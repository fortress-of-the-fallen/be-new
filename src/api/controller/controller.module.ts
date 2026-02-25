import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { RolesGuard } from '../guard/roles.guard';
import * as fs from 'fs';
import * as path from 'path';
import { controllers } from 'src/shared/decorator/controller.decorator';

const controllerDir = path.resolve(__dirname, './v1');
const srcControllerDir = path.resolve(process.cwd(), 'src/api/controller/v1');

const sourceControllerFiles = fs.existsSync(srcControllerDir)
   ? new Set(
        fs
           .readdirSync(srcControllerDir)
           .filter(file => file.endsWith('.ts') && !file.endsWith('.spec.ts'))
           .map(file => file.replace(/\.ts$/, '')),
     )
   : null;

fs.readdirSync(controllerDir)
   .filter(file => file.endsWith('.js'))
   .filter(file => {
      if (!sourceControllerFiles) {
         return true;
      }

      const baseName = file.replace(/\.js$/, '');
      return sourceControllerFiles.has(baseName);
   })
   .forEach(file => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(path.join(controllerDir, file));
   });

@Module({
   controllers: [...controllers],
   providers: [RolesGuard],
   imports: [
      InfrastructureModule,
      ThrottlerModule.forRoot({
         throttlers: [
            {
               name: 'defalult',
               ttl: 60_000,
               limit: 5,
            },
         ],
      }),
   ],
})
export class ControllerModule {}

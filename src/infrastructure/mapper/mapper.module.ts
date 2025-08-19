import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { DynamicModule, Module } from '@nestjs/common';
import { profiles } from 'src/domain/decorator/profile.decorator';
import * as fs from 'fs';
import * as path from 'path';

const mapperDir = path.resolve(__dirname, './profile');

fs.readdirSync(mapperDir)
   .filter(file => file.endsWith('.js'))
   .forEach(file => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(path.join(mapperDir, file));
   });

@Module({})
export class MappingModule {
   static register(): DynamicModule {
      return {
         module: MappingModule,
         imports: [
            AutomapperModule.forRootAsync({
               useFactory: () => ({
                  strategyInitializer: classes(),
               }),
               inject: [],
            }),
         ],
         providers: [
            ...profiles.map(profile => ({
               provide: profile,
               useClass: profile,
            })),
         ],
         exports: [AutomapperModule, ...profiles],
      };
   }
}

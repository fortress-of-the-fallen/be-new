import { Module } from '@nestjs/common';
import { AppGateway } from './websocket-gateway';
import path from 'path';
import * as fs from 'fs';
import { hubs } from 'src/domain/decorator/hub.decorator';
import { IBroadcastHandler } from 'src/application/interface/broadcast-handler/i-broadcast-handler';
import { BroadcastHandler } from './broadcast-handler';

const hubDir = path.resolve(__dirname, './hub');

fs.readdirSync(hubDir)
   .filter(file => file.endsWith('.js'))
   .forEach(file => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(path.join(hubDir, file));
   });

const registeredHubs = hubs;

@Module({
   providers: [
      AppGateway,
      ...registeredHubs,
      {
         provide: IBroadcastHandler,
         useClass: BroadcastHandler,
      },
   ],

   exports: [IBroadcastHandler],
})
export class BroadcastModule {}

import { Hub } from 'src/shared/decorator/hub.decorator';
import { BaseHub } from './baes.hub';
import { Socket } from 'socket.io';

@Hub()
export class LoginHub extends BaseHub {
   route = '/login';

   constructor() {
      super();
   }
}

import { Hub } from 'src/domain/decorator/hub.decorator';
import { BaseHub } from './baes.hub';
import { Socket } from 'socket.io';

@Hub()
export class LoginHub extends BaseHub {
   route = '/login';

   constructor() {
      super();

      this.register('sample', this.sampleHandler);
   }

   sampleHandler = (socket: Socket, data?: any, ack?: (res: any) => void) => {
      if (ack) ack({ ok: true, user: data });
   };
}

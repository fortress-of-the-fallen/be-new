import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { hubs } from 'src/shared/decorator/hub.decorator';
import { BroadcastHandler } from './broadcast-handler';

@WebSocketGateway()
export class AppGateway {
   @WebSocketServer() server: Server;
   constructor(private readonly broadcastHandler: BroadcastHandler) {}

   afterInit(server: Server) {
      this.broadcastHandler.setServer(this.server);

      for (const Hub of hubs) {
         const hub = new Hub();
         hub.init(server);
      }
   }
}

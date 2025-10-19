import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { hubs } from 'src/domain/decorator/hub.decorator';
import { IBroadcastHandler } from 'src/application/interface/broadcast-handler/i-broadcast-handler';
import { Inject } from '@nestjs/common';

@WebSocketGateway()
export class AppGateway {
   @WebSocketServer() server: Server;
   constructor(@Inject(IBroadcastHandler) private broadcastHandler: IBroadcastHandler) {}

   afterInit(server: Server) {
      this.broadcastHandler.setServer(this.server);

      for (const Hub of hubs) {
         const hub = new Hub();
         hub.init(server);
      }
   }
}

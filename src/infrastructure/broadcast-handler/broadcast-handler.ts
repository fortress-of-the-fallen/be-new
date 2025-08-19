import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { IBroadcastHandler } from 'src/application/interface/broadcast-handler/i-broadcast-handler';

@Injectable()
export class BroadcastHandler implements IBroadcastHandler {
   private server: Server;

   setServer(server: Server) {
      this.server = server;
   }

   async sendMessageAsync(id: string, message: any, route: string = '/'): Promise<void> {
      const nsp = this.server.of(route);
      const socket = nsp.sockets.get(id);
      if (socket) {
         socket.emit('message', message);
      } else {
         console.log(`Socket ${id} not found in namespace ${route}`);
      }
   }

   async sendMessageToGroupAsync(
      groupId: string,
      message: any,
      route: string = '/',
   ): Promise<void> {
      const nsp = this.server.of(route);
      nsp.to(groupId).emit('message', message);
   }

   async sendMessageToAllAsync(message: any, route: string = '/'): Promise<void> {
      const nsp = this.server.of(route);
      nsp.emit('message', message);
   }

   isClientConnected(connectionId: string, route: string = '/'): boolean {
      const nsp = this.server.of(route);
      return nsp.sockets.has(connectionId);
   }
}

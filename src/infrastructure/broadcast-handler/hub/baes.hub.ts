import { Server, Socket } from 'socket.io';
import { IHub } from 'src/application/interface/broadcast-handler/i-hub';

export abstract class BaseHub implements IHub {
   abstract route: string;
   private handlers: Map<string, (data: any, ack: (res: any) => void) => void> = new Map();

   register(name: string, callback: (data: any, ack: (res: any) => void) => void): void {
      this.handlers.set(name, callback);
   }

   init(server: Server): void {
      const nsp = server.of(this.route);
      nsp.on('connection', (socket: Socket) => {
         for (const [name, handler] of this.handlers.entries()) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            socket.on(name, (data, ack) => handler.call(this, socket, data, ack));
         }
      });

      this.register('getConnectionId', (socket: Socket, data?: any, ack?: (res: any) => void) => {
         if (ack) ack({ connectionId: socket.id });
      });
   }
}

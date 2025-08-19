import { Server } from 'socket.io';

export interface IHub {
   route: string;
   register(name: string, callback: (data: any, ack: (response: any) => void) => void): void;
   init(server: Server): void;
}

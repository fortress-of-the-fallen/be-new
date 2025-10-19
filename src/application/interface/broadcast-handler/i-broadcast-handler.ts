export interface IBroadcastHandler {
   setServer(server: any): void;
   sendMessageAsync(id: string, message: any, route: string): Promise<void>;
   sendMessageToGroupAsync(groupId: string, message: any, route: string): Promise<void>;
   isClientConnected(connectionId: string, route: string): boolean;
}

export const IBroadcastHandler = Symbol('IBroadcastHandler');

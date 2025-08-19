export class EventRouter {
   private routes = new Map<string, (data: any, client: any, server: any) => any>();

   register(event: string, handler: (data: any, client: any, server: any) => any) {
      this.routes.set(event, handler);
   }

   handle(event: string, data: any, client: any, server: any) {
      const fn = this.routes.get(event);
      if (!fn) throw new Error(`No handler for ${event}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return fn(data, client, server);
   }
}

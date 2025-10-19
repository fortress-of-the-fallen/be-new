export class BroadcastMessage<T> {
   constructor(
      public readonly event: string,
      public readonly data: T,
   ) {}
}

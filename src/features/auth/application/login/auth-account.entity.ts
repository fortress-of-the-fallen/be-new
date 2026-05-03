export class AuthAccount {
   constructor(
      public readonly id: string,
      public readonly username: string,
      public readonly passwordHash: string,
      public readonly playerId: string | null,
      public readonly displayName: string,
      public readonly status: string,
      public readonly roles: string[],
      public readonly maxSession: number,
   ) {}
}

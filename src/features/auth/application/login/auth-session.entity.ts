export class AuthSession {
   constructor(
      public readonly id: string,
      public readonly userId: string,
      public readonly playerId: string,
      public readonly expiresAt: Date,
      public readonly revokedAt: Date | null,
   ) {}
}

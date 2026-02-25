export class AuthAccount {
   constructor(
      public readonly id: string,
      public readonly username: string,
      public readonly email: string,
      public readonly passwordHash: string,
      public readonly roles: string[],
      public readonly maxSession: number,
      public readonly isDeleted: boolean,
      public readonly isLocked: boolean,
   ) {}
}

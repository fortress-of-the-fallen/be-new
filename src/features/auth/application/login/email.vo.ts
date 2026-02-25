export class Email {
   private constructor(public readonly value: string) {}

   static create(value: string): Email {
      const normalized = value?.trim().toLowerCase();
      if (!normalized || !normalized.includes('@')) {
         throw new Error('Email is invalid');
      }

      return new Email(normalized);
   }
}

export class Username {
   private constructor(public readonly value: string) {}

   static create(value: string): Username {
      const normalized = value?.trim();
      if (!normalized) {
         throw new Error('Username is required');
      }

      return new Username(normalized);
   }
}

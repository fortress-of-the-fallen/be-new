import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';

class IdentityHelper {
   static generateUUID(): string {
      return uuidv4();
   }

   static generateNanoID(length: number = 21): string {
      return nanoid(length);
   }
}

export { IdentityHelper };

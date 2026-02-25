import { BaseRes } from './base-res.model';

export class ValidateRes extends BaseRes {
   key: string;
   errors: string[];

   constructor(key: string, errors: string[]) {
      super();
      this.key = key;
      this.errors = errors;
   }
}

import { Injectable, Scope } from '@nestjs/common';

export const seeders: Array<new (...args: any[]) => unknown> = [];

export function Seeder(): ClassDecorator {
   return (target: any) => {
      Injectable({ scope: Scope.TRANSIENT })(target);

      seeders.push(target);
   };
}

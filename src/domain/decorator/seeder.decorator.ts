import { Injectable, Scope } from '@nestjs/common';

/**
 * Stores seeder classes decorated with `@Seeder`.
 */
export const seeders: Array<new (...args: any[]) => unknown> = [];

/**
 * Marks a class as a transient injectable seeder and registers it.
 */
export function Seeder(): ClassDecorator {
   return (target: any) => {
      Injectable({ scope: Scope.TRANSIENT })(target);

      seeders.push(target);
   };
}

import { Injectable, Scope } from '@nestjs/common';

/**
 * Stores job classes decorated with `@Job`.
 */
export const jobs: Array<new (...args: any[]) => unknown> = [];

/**
 * Marks a class as a transient injectable job and registers it.
 */
export function Job() {
   return function (target: any) {
      Injectable({ scope: Scope.TRANSIENT })(target);

      jobs.push(target);
   };
}

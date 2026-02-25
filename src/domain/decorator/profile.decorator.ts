import { Injectable, Scope } from '@nestjs/common';

/**
 * Stores profile classes decorated with `@Profile`.
 */
export const profiles: Array<new (...args: any[]) => unknown> = [];

/**
 * Marks a class as a default-scope injectable profile and registers it.
 */
export function Profile() {
   return function (target: any) {
      Injectable({ scope: Scope.DEFAULT })(target);

      profiles.push(target);
   };
}

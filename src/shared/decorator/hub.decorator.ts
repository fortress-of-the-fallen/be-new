import { Injectable, Scope } from '@nestjs/common';

/**
 * Stores hub classes decorated with `@Hub`.
 */
export const hubs: any[] = [];

/**
 * Marks a class as a default-scope injectable hub and registers it.
 */
export function Hub(): ClassDecorator {
   return (target: any) => {
      Injectable({ scope: Scope.DEFAULT })(target);

      hubs.push(target);
   };
}

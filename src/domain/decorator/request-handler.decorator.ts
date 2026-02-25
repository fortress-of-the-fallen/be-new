import { Injectable, Scope } from '@nestjs/common';
import 'reflect-metadata';

/**
 * Stores request handler classes decorated with `@RequestHandler`.
 */
export const RegisteredHandlers: any[] = [];

/**
 * Marks a class as request-scoped and tags it with a request type metadata key.
 */
export function RequestHandler(requestType: any) {
   return function (target: any) {
      Injectable({ scope: Scope.REQUEST })(target);

      Reflect.defineMetadata('requestType', requestType, target);
      RegisteredHandlers.push(target);
   };
}

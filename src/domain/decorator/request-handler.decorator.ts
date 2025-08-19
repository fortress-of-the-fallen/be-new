import { Injectable, Scope } from '@nestjs/common';
import 'reflect-metadata';

export const RegisteredHandlers: any[] = [];

export function RequestHandler(requestType: any) {
   return function (target: any) {
      Injectable({ scope: Scope.REQUEST })(target);

      Reflect.defineMetadata('requestType', requestType, target);
      RegisteredHandlers.push(target);
   };
}

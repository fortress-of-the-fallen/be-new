import 'reflect-metadata';
import { Controller, Type } from '@nestjs/common';

export const controllers: Type[] = [];

export function Controllers(options?: { path?: string; version?: string }) {
   return function (target: Type<any>) {
      const controllerDecorator = options !== undefined ? Controller(options) : Controller();

      Reflect.decorate([controllerDecorator], target);
      controllers.push(target);
   };
}

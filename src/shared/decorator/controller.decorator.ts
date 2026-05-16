import 'reflect-metadata';
import { Controller, Type } from '@nestjs/common';

/**
 * Stores all controller classes decorated with `@Controllers`.
 */
export const controllers: Type[] = [];

/**
 * Applies NestJS `@Controller` and registers the controller class for discovery.
 */
export function Controllers(options?: { path?: string; version?: string }) {
   return function (target: Type<any>) {
      const controllerDecorator = options !== undefined ? Controller(options) : Controller();

      Reflect.decorate([controllerDecorator], target);
      controllers.push(target);
   };
}

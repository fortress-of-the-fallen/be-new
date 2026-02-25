import { Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Collected entity metadata used for schema registration.
 */
export const entities: { name: string; schema: any }[] = [];

/**
 * Marks a class as a Mongoose schema and registers its generated schema.
 */
export function Entity() {
   return function (target: any) {
      Schema()(target);
      entities.push({ name: target.name, schema: SchemaFactory.createForClass(target) });
   };
}

import { Schema, SchemaFactory } from '@nestjs/mongoose';

export const entities: { name: string; schema: any }[] = [];

export function UniEntity() {
   return function (target: any) {
      Schema()(target);
      entities.push({ name: target.name, schema: SchemaFactory.createForClass(target) });
   };
}

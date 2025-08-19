import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IBaseEntity } from './base/i-base.entity';
import { IdentityHelper } from '../helper/identity.helper';
import { Entity } from '../decorator/entity.decorator';

@Entity()
export class BookCategory extends IBaseEntity {
   @Prop({ type: String, required: true, default: () => IdentityHelper.generateUUID() })
   declare _id: string;

   @Prop({ required: true, unique: true })
   name: string;

   @Prop()
   description?: string;

   constructor(props: Partial<BookCategory>) {
      super();
      Object.assign(this, props);
   }
}

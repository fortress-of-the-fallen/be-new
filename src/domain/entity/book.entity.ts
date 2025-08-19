import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IBaseEntity } from './base/i-base.entity';
import { User } from './user.entity';
import { IdentityHelper } from '../helper/identity.helper';
import { Entity } from '../decorator/entity.decorator';

@Entity()
export class Book extends IBaseEntity {
   @Prop({ type: String, required: true, default: () => IdentityHelper.generateUUID() })
   declare _id: string;

   @Prop({ required: true })
   title: string;

   @Prop({ required: true, ref: 'User', type: String })
   author: string | User;

   @Prop({ required: true })
   description: string;

   @Prop({ required: true, default: () => new Date() })
   publishedDate: Date;

   constructor(props: Partial<Book>) {
      super();
      Object.assign(this, props);
   }
}

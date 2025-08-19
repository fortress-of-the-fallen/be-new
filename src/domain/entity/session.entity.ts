import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IBaseEntity } from './base/i-base.entity';
import { IdentityHelper } from '../helper/identity.helper';
import { User } from './user.entity';
import { Entity } from '../decorator/entity.decorator';

export const sessionExpiresIn = 60 * 60 * 24 * 30;

@Entity()
export class Session extends IBaseEntity {
   @Prop({ type: String, required: true, default: () => IdentityHelper.generateUUID() })
   declare _id: string;

   @Prop({ type: String, ref: 'User', required: true })
   user: string | User;

   @Prop({ required: true, default: () => new Date() })
   createdAt: Date;

   @Prop({
      required: true,
      default: () => new Date(Date.now() + sessionExpiresIn * 1000),
      expires: sessionExpiresIn,
   })
   expiresAt: Date;

   @Prop({ required: true, default: () => false })
   isRevoked: boolean;

   @Prop({ required: true })
   userAgent: string;

   @Prop({ required: true })
   ipAddress: string;

   constructor(props: Partial<Session>) {
      super();
      Object.assign(this, props);
   }
}

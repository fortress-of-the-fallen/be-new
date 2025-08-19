import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class IBaseEntity extends Document {
   @Prop({ required: true, default: false })
   isDeleted: boolean;

   @Prop({ required: true, default: false })
   isLocked: boolean;
}

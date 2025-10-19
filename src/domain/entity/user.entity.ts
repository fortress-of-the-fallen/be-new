import { Prop } from '@nestjs/mongoose';
import { IBaseEntity } from './base/i-base.entity';
import { IdentityHelper } from '../helper/identity.helper';
import { RoleBase } from '../enum/role-base.enum';
import { Entity } from '../decorator/entity.decorator';

@Entity()
export class User extends IBaseEntity {
   @Prop({ type: String, required: true, default: () => IdentityHelper.generateUUID() })
   declare _id: string;

   @Prop({ required: false })
   name: string;

   @Prop({ required: false, unique: true })
   username: string;

   @Prop({ required: false, unique: true })
   email: string;

   @Prop({ required: false })
   password: string;

   @Prop({ type: [String], enum: RoleBase, required: true })
   role: RoleBase[];

   @Prop({ required: true, default: () => 5 })
   maxSession: number;

   @Prop({ required: true, default: () => 3 })
   max_game_user: number;

   @Prop({ type: [{ type: String, ref: 'GameUser' }], default: [] })
   gameprofile: string[];

   constructor(props: Partial<User>) {
      super();
      Object.assign(this, props);
   }
}

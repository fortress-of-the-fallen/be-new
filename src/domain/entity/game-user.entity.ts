import { Prop } from '@nestjs/mongoose';
import { IBaseEntity } from './base/i-base.entity';
import { IdentityHelper } from '../helper/identity.helper';
import { StarterRace } from '../enum/starter-race.enum';
import { GenderEnum } from '../enum/gender.enum';
import { Entity } from '../decorator/entity.decorator';

@Entity()
export class GameUser extends IBaseEntity {
   @Prop({ type: String, required: true, default: () => IdentityHelper.generateUUID() })
   declare _id: string;

   @Prop({ required: true })
   character_name: string;

   @Prop({ type: String, enum: StarterRace, required: true })
   race: StarterRace;

   @Prop({ type: String, enum: GenderEnum, required: true })
   gender: GenderEnum;

   @Prop({ type: Object, default: null })
   character: any;

   @Prop({ type: Object, default: null })
   inventory: any;

   @Prop({ type: Object, default: null })
   equipments: any;

   @Prop({ type: String, ref: 'User', required: true })
   userId: string;

   constructor(props: Partial<GameUser>) {
      super();
      Object.assign(this, props);
   }
}

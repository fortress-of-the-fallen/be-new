import { Prop } from '@nestjs/mongoose';
import { IBaseEntity } from './base/i-base.entity';
import { IdentityHelper } from 'src/shared/helper/identity.helper';
import { StarterRace } from 'src/features/character/application/starter-race.enum';
import { GenderEnum } from 'src/features/character/application/gender.enum';
import { Entity } from 'src/shared/decorator/entity.decorator';

@Entity()
export class Character extends IBaseEntity {
   @Prop({ type: String, required: true, default: () => IdentityHelper.generateUUID() })
   declare _id: string;

   @Prop({ required: true })
   character_name: string;

   @Prop({ type: String, enum: StarterRace, required: true })
   race: StarterRace;

   @Prop({ type: String, enum: GenderEnum, required: true })
   gender: GenderEnum;

   @Prop({ type: String, ref: 'User', required: true })
   userId: string;

   constructor(props: Partial<Character>) {
      super();
      Object.assign(this, props);
   }
}

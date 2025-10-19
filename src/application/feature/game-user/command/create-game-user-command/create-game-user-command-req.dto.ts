import { AutoMap } from '@automapper/classes';
import { GenderEnum } from 'src/domain/enum/gender.enum';

export class CreateGameUserReqDto {
   @AutoMap()
   character_name: string;

   @AutoMap()
   gender: GenderEnum;

   @AutoMap()
   userId: string;
}

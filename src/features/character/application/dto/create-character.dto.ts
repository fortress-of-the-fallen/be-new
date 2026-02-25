import { GenderEnum } from 'src/features/character/application/gender.enum';

export class CreateCharacterDto {
   character_name: string;
   gender: GenderEnum;
}

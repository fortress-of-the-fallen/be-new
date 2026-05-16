import { GenderEnum } from 'src/features/character/application/gender.enum';

export class CreateCharacterDto {
   character_name: string;
   race: string;
   gender: GenderEnum;
   hair: string;
   beard: string;
   eye: string;
   hairColor: string;
   beardColor: string;
   eyeColor: string;
}

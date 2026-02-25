import { ApiProperty } from '@nestjs/swagger';
import { GenderEnum } from 'src/features/character/application/gender.enum';

class CharacterAppearanceRes {
   @ApiProperty({ example: 'appearance-id-123' })
   _id: string;

   @ApiProperty({ example: 'ShortWavy' })
   hair: string;

   @ApiProperty({ example: 'TrimGoatee' })
   beard: string;

   @ApiProperty({ example: 'RoundSharp' })
   eye: string;

   @ApiProperty({ example: '#4A2C1D' })
   hairColor: string;

   @ApiProperty({ example: '#2C1B12' })
   beardColor: string;

   @ApiProperty({ example: '#3A86FF' })
   eyeColor: string;
}

export class CharacterRes {
   @ApiProperty({
      example: 'character-id-123',
      description: 'Character ID',
   })
   _id: string;

   @ApiProperty({
      example: 'MyCharacter',
      description: 'Character name',
   })
   character_name: string;

   @ApiProperty({
      example: 'human',
      description: 'Character race',
   })
   race: string;

   @ApiProperty({
      enum: GenderEnum,
      example: GenderEnum.Male,
      description: 'Character gender',
   })
   gender: GenderEnum;

   @ApiProperty({
      example: 'user-id-123',
      description: 'User ID (foreign key)',
   })
   userId: string;

   @ApiProperty({
      type: CharacterAppearanceRes,
      nullable: true,
      description: 'Character appearance details',
   })
   appearance?: CharacterAppearanceRes | null;
}

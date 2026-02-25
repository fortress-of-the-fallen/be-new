import { ApiProperty } from '@nestjs/swagger';
import { StarterRace } from 'src/features/character/application/starter-race.enum';
import { GenderEnum } from 'src/features/character/application/gender.enum';

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
      enum: StarterRace,
      example: StarterRace.Human,
      description: 'Character race',
   })
   race: StarterRace;

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
}

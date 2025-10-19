import { ApiProperty } from '@nestjs/swagger';
import { StarterRace } from 'src/domain/enum/starter-race.enum';
import { GenderEnum } from 'src/domain/enum/gender.enum';

export class GameUserRes {
   @ApiProperty({
      example: 'game-user-id-123',
      description: 'Game user ID',
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
      example: null,
      description: 'Character data',
   })
   character: any;

   @ApiProperty({
      example: null,
      description: 'Inventory data',
   })
   inventory: any;

   @ApiProperty({
      example: null,
      description: 'Equipment data',
   })
   equipments: any;
}

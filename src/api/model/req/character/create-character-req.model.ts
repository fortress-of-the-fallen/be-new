import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsHexColor, IsNotEmpty, IsString } from 'class-validator';
import { GenderEnum } from 'src/features/character/application/gender.enum';

export class CreateCharacterReq {
   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'MyCharacter',
      description: 'Character name',
   })
   character_name: string;

   @IsEnum(GenderEnum)
   @IsNotEmpty()
   @ApiProperty({
      enum: GenderEnum,
      example: GenderEnum.Male,
      description: 'Character gender',
   })
   gender: GenderEnum;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'human',
      description: 'Character race',
   })
   race: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'ShortWavy',
      description: 'Hair style key',
   })
   hair: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'TrimGoatee',
      description: 'Beard style key',
   })
   beard: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'RoundSharp',
      description: 'Eye shape key',
   })
   eye: string;

   @IsHexColor()
   @ApiProperty({
      example: '#4A2C1D',
      description: 'Hair color in HEX',
   })
   hairColor: string;

   @IsHexColor()
   @ApiProperty({
      example: '#2C1B12',
      description: 'Beard color in HEX',
   })
   beardColor: string;

   @IsHexColor()
   @ApiProperty({
      example: '#3A86FF',
      description: 'Eye color in HEX',
   })
   eyeColor: string;
}

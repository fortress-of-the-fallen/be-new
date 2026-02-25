import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
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
}

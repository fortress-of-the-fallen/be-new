import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryReqModel {
   @IsNotEmpty()
   @IsString()
   @ApiProperty({
      description: 'Name of the category',
      example: 'Science Fiction',
   })
   name: string;

   @IsOptional()
   @IsString()
   @ApiProperty({
      description: 'Description of the category',
      example:
         'A genre of speculative fiction that typically deals with imaginative and futuristic concepts.',
      required: false,
   })
   description?: string;
}

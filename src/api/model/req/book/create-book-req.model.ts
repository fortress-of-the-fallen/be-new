import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateBookReqModel {
   @IsNotEmpty()
   @ApiProperty({
      description: 'Title of the book',
      example: 'The Great Gatsby',
   })
   title: string;

   @IsNotEmpty()
   @ApiProperty({
      description: 'Description of the book',
      example: 'A novel written by American author F. Scott Fitzgerald.',
   })
   description: string;

   @IsNotEmpty()
   @ApiProperty({
      description: 'Category ID of the book',
      example: '123e4567-e89b-12d3-a456-426614174000',
   })
   category: string;
}

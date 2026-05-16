import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileReq {
   @IsOptional()
   @IsString()
   @MinLength(3)
   @MaxLength(32)
   @ApiProperty({
      example: 'Player01',
      required: false,
   })
   displayName?: string;

   @IsOptional()
   @IsString()
   @MinLength(2)
   @MaxLength(32)
   @ApiProperty({
      example: 'avatar_01',
      required: false,
   })
   avatar?: string;

   @IsOptional()
   @IsString()
   @MinLength(2)
   @MaxLength(4)
   @ApiProperty({
      example: 'VN',
      required: false,
   })
   country?: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'bb6ef5e8-26b6-4f49-9d55-6b0f56a00001',
   })
   idempotencyKey: string;
}

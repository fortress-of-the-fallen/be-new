import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginReq {
   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'admin',
   })
   username: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'admin123',
   })
   password: string;

   @IsOptional()
   @IsBoolean()
   @ApiProperty({
      example: true,
      required: false,
   })
   rememberMe?: boolean;

   @IsNotEmpty()
   @ApiProperty({
      example: 'sEnpxxIeymn-KuvBAAAB',
      required: true,
   })
   @IsString()
   connectionId: string;
}

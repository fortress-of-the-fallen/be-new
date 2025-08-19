import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginReq {
   @IsString()
   @IsNotEmpty()
   @AutoMap()
   @ApiProperty({
      example: 'admin',
   })
   username: string;

   @IsString()
   @IsNotEmpty()
   @AutoMap()
   @ApiProperty({
      example: 'admin123',
   })
   password: string;

   @IsOptional()
   @IsBoolean()
   @AutoMap()
   @ApiProperty({
      example: true,
      required: false,
   })
   rememberMe?: boolean;
}

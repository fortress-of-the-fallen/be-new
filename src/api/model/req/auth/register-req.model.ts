import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

class RegisterReq {
   @IsNotEmpty()
   @ApiProperty({ example: 'example' })
   username: string;

   @IsEmail()
   @IsNotEmpty()
   @ApiProperty({ example: 'example@email.com' })
   email: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({ example: 'password123' })
   @MinLength(8)
   @MaxLength(20)
   password: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({ example: 'password123' })
   @MinLength(8)
   @MaxLength(20)
   confirmPassword: string;
}
export { RegisterReq };

import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

class RegisterReq {
   @AutoMap()
   @IsNotEmpty()
   @ApiProperty({ example: 'example' })
   username: string;

   @AutoMap()
   @IsString()
   @IsNotEmpty()
   @ApiProperty({ example: 'password123' })
   @MinLength(8)
   @MaxLength(20)
   password: string;

   @AutoMap()
   @IsString()
   @IsNotEmpty()
   @ApiProperty({ example: 'password123' })
   @MinLength(8)
   @MaxLength(20)
   confirmPassword: string;
}
export { RegisterReq };

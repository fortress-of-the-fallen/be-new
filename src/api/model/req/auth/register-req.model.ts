import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

class RegisterReq {
   @IsNotEmpty()
   @IsString()
   @MinLength(3)
   @MaxLength(32)
   @ApiProperty({ example: 'player01' })
   username: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({ example: 'secret123' })
   @MinLength(8)
   @MaxLength(64)
   password: string;

   @IsOptional()
   @IsString()
   @ApiProperty({ example: 'secret123', required: false })
   @MinLength(8)
   @MaxLength(64)
   confirmPassword?: string;

   @IsOptional()
   @IsString()
   @MinLength(1)
   @MaxLength(32)
   @ApiProperty({ example: 'Player01', required: false })
   displayName?: string;
}
export { RegisterReq };

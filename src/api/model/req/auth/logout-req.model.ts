import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutReq {
   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'refresh-token',
   })
   refreshToken: string;
}

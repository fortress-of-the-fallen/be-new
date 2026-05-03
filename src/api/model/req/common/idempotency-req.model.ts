import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class IdempotencyReq {
   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: 'bb6ef5e8-26b6-4f49-9d55-6b0f56a00001',
   })
   idempotencyKey: string;
}

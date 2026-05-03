import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IdempotencyReq } from './idempotency-req.model';

export class ConfigIdempotencyReq extends IdempotencyReq {
   @IsString()
   @IsNotEmpty()
   @ApiProperty({
      example: '2026.05.02.1',
   })
   configVersion: string;
}

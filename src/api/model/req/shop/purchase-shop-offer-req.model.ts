import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ConfigIdempotencyReq } from '../common/config-idempotency-req.model';

export class PurchaseShopOfferReq extends ConfigIdempotencyReq {
   @Type(() => Number)
   @IsOptional()
   @IsInt()
   @Min(1)
   @ApiPropertyOptional({
      example: 1,
      default: 1,
   })
   quantity?: number;
}

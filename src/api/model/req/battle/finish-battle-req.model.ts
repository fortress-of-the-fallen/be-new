import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { IdempotencyReq } from '../common/idempotency-req.model';

export class FinishBattleReq extends IdempotencyReq {
   @IsString()
   @IsIn(['WIN', 'LOSE', 'DRAW'])
   @ApiProperty({ example: 'WIN' })
   result: 'WIN' | 'LOSE' | 'DRAW';

   @Type(() => Number)
   @IsNumber()
   @Min(1)
   @Max(3600)
   @ApiProperty({ example: 82 })
   durationSec: number;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({ example: 'DestroyAllTarget' })
   winCondition: string;

   @Type(() => Number)
   @IsNumber()
   @Min(0)
   @Max(1)
   @ApiProperty({ example: 0.63 })
   playerPercent: number;
}

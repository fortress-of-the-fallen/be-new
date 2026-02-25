import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCharacterBaseAttributesReq {
   @IsOptional()
   @IsInt()
   @Min(0)
   @ApiPropertyOptional({ example: 10, description: 'Giá trị STR mới (không âm).' })
   str?: number;

   @IsOptional()
   @IsInt()
   @Min(0)
   @ApiPropertyOptional({ example: 12, description: 'Giá trị DEX mới (không âm).' })
   dex?: number;

   @IsOptional()
   @IsInt()
   @Min(0)
   @ApiPropertyOptional({ example: 11, description: 'Giá trị CON mới (không âm).' })
   con?: number;

   @IsOptional()
   @IsInt()
   @Min(0)
   @ApiPropertyOptional({ example: 8, description: 'Giá trị INT mới (không âm).' })
   int?: number;

   @IsOptional()
   @IsInt()
   @Min(0)
   @ApiPropertyOptional({ example: 9, description: 'Giá trị WIS mới (không âm).' })
   wis?: number;

   @IsOptional()
   @IsInt()
   @Min(0)
   @ApiPropertyOptional({ example: 7, description: 'Giá trị CHA mới (không âm).' })
   cha?: number;
}

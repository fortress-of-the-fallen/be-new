import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
   ArrayMaxSize,
   ArrayMinSize,
   IsArray,
   IsInt,
   IsNotEmpty,
   IsString,
   Min,
   ValidateNested,
} from 'class-validator';

class FormationPositionReq {
   @IsInt()
   @ApiProperty({ example: 0 })
   x: number;

   @IsInt()
   @ApiProperty({ example: 0 })
   y: number;

   @IsInt()
   @ApiProperty({ example: 0 })
   z: number;
}

class FormationSlotReq {
   @IsInt()
   @Min(0)
   @ApiProperty({ example: 0 })
   slot: number;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({ example: 'Soldier' })
   unitName: string;

   @ValidateNested()
   @Type(() => FormationPositionReq)
   @ApiProperty({ type: FormationPositionReq })
   position: FormationPositionReq;
}

export class UpdateFormationReq {
   @IsString()
   @IsNotEmpty()
   @ApiProperty({ example: 'active' })
   name: string;

   @IsArray()
   @ArrayMinSize(1)
   @ArrayMaxSize(5)
   @ValidateNested({ each: true })
   @Type(() => FormationSlotReq)
   @ApiProperty({ type: [FormationSlotReq] })
   slots: FormationSlotReq[];
}

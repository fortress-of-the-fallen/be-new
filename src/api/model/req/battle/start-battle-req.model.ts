import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class StartBattleReq {
   @IsString()
   @IsIn(['PVP', 'PVE', 'FAKE_PVP'])
   @ApiProperty({ example: 'FAKE_PVP', enum: ['PVP', 'PVE', 'FAKE_PVP'] })
   mode: 'PVP' | 'PVE' | 'FAKE_PVP';

   @IsString()
   @IsNotEmpty()
   @ApiProperty({ example: 'active' })
   formationName: string;

   @IsString()
   @IsNotEmpty()
   @ApiProperty({ example: '2026.05.02.1' })
   configVersion: string;
}

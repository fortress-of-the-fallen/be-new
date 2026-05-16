import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsDateString, IsOptional } from 'class-validator';

export class UpdateTutorialProgressReq {
   @Allow()
   @ApiProperty({
      example: {
         finishOnboarding: true,
         finishFirstDeploy: true,
         isDoneUpgradeUnitTutorial: true,
      },
   })
   updates: Record<string, unknown>;

   @IsOptional()
   @IsDateString()
   @ApiProperty({
      example: '2026-05-05T10:00:00.000Z',
      required: false,
   })
   clientUpdatedAt?: string;
}

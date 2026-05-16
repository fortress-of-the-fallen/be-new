import { Injectable } from '@nestjs/common';
import { GetFormationApplicationService } from './get-formation';
import { UpdateFormationApplicationService, UpdateFormationDto } from './update-formation';

@Injectable()
export class FormationApplicationService {
   constructor(
      private readonly getFormationApplicationService: GetFormationApplicationService,
      private readonly updateFormationApplicationService: UpdateFormationApplicationService,
   ) {}

   async getFormation(playerId: string) {
      return this.getFormationApplicationService.getFormation(playerId);
   }

   async updateFormation(playerId: string, dto: UpdateFormationDto) {
      return this.updateFormationApplicationService.updateFormation(playerId, dto);
   }
}

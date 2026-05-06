import { Injectable } from '@nestjs/common';
import { GetCurrentPlayerApplicationService } from './me';
import { UpdateProfileApplicationService, UpdateProfileDto } from './profile';
import { UpdateTutorialProgressApplicationService, UpdateTutorialProgressDto } from './tutorial-progress';

@Injectable()
export class PlayerApplicationService {
   constructor(
      private readonly getCurrentPlayerApplicationService: GetCurrentPlayerApplicationService,
      private readonly updateProfileApplicationService: UpdateProfileApplicationService,
      private readonly updateTutorialProgressApplicationService: UpdateTutorialProgressApplicationService,
   ) {}

   async getCurrentPlayer(playerId: string) {
      return this.getCurrentPlayerApplicationService.getCurrentPlayer(playerId);
   }

   async updateProfile(playerId: string, dto: UpdateProfileDto) {
      return this.updateProfileApplicationService.updateProfile(playerId, dto);
   }

   async updateTutorialProgress(playerId: string, dto: UpdateTutorialProgressDto) {
      return this.updateTutorialProgressApplicationService.updateTutorialProgress(playerId, dto);
   }
}

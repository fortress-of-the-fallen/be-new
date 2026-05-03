import { Injectable } from '@nestjs/common';
import { GetCurrentPlayerApplicationService } from './me';
import { UpdateProfileApplicationService, UpdateProfileDto } from './profile';

@Injectable()
export class PlayerApplicationService {
   constructor(
      private readonly getCurrentPlayerApplicationService: GetCurrentPlayerApplicationService,
      private readonly updateProfileApplicationService: UpdateProfileApplicationService,
   ) {}

   async getCurrentPlayer(playerId: string) {
      return this.getCurrentPlayerApplicationService.getCurrentPlayer(playerId);
   }

   async updateProfile(playerId: string, dto: UpdateProfileDto) {
      return this.updateProfileApplicationService.updateProfile(playerId, dto);
   }
}

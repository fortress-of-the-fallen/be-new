import { Injectable } from '@nestjs/common';
import { TutorialProgressService } from 'src/shared/services/tutorial-progress.service';
import { UpdateTutorialProgressDto } from './update-tutorial-progress.dto';

@Injectable()
export class UpdateTutorialProgressApplicationService {
   constructor(private readonly tutorialProgressService: TutorialProgressService) {}

   async updateTutorialProgress(playerId: string, dto: UpdateTutorialProgressDto) {
      return {
         tutorialProgress: await this.tutorialProgressService.updateTutorialProgress({
            playerId,
            updates: dto.updates,
            clientUpdatedAt: dto.clientUpdatedAt,
         }),
      };
   }
}

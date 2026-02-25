import { Injectable } from '@nestjs/common';
import { CreateCharacterApplicationService, CreateCharacterDto } from './create';
import { DeleteCharacterApplicationService } from './delete';
import { ListCharacterApplicationService } from './list';

@Injectable()
export class CharacterApplicationService {
   constructor(
      private readonly createCharacterApplicationService: CreateCharacterApplicationService,
      private readonly deleteCharacterApplicationService: DeleteCharacterApplicationService,
      private readonly listCharacterApplicationService: ListCharacterApplicationService,
   ) {}

   async createCharacter(reqDto: CreateCharacterDto, sessionId?: string): Promise<[string, string]> {
      return this.createCharacterApplicationService.createCharacter(reqDto, sessionId);
   }

   async listCharacters(sessionId?: string): Promise<[string, any[]]> {
      return this.listCharacterApplicationService.listCharacters(sessionId);
   }

   async deleteCharacter(characterId: string, sessionId?: string): Promise<string> {
      return this.deleteCharacterApplicationService.deleteCharacter(characterId, sessionId);
   }
}

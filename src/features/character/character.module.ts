import { Module } from '@nestjs/common';
import {
   CharacterApplicationService,
   CreateCharacterApplicationService,
   DeleteCharacterApplicationService,
   ListCharacterApplicationService,
} from './application';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';

@Module({
   imports: [PersistenceModule],
   providers: [
      CharacterApplicationService,
      CreateCharacterApplicationService,
      DeleteCharacterApplicationService,
      ListCharacterApplicationService,
   ],
   exports: [CharacterApplicationService],
})
export class CharacterModule {}

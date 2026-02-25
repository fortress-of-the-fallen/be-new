import { Module } from '@nestjs/common';
import {
   CharacterApplicationService,
   CreateCharacterApplicationService,
   DeleteCharacterApplicationService,
   ListCharacterApplicationService,
   UpdateCharacterBaseAttributesApplicationService,
} from './application';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';

@Module({
   imports: [PersistenceModule],
   providers: [
      CharacterApplicationService,
      CreateCharacterApplicationService,
      DeleteCharacterApplicationService,
      ListCharacterApplicationService,
      UpdateCharacterBaseAttributesApplicationService,
   ],
   exports: [CharacterApplicationService],
})
export class CharacterModule {}

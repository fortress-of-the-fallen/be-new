import { Module } from '@nestjs/common';
import { CharacterApplicationService } from './application/character.application-service';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';

@Module({
   imports: [PersistenceModule],
   providers: [CharacterApplicationService],
   exports: [CharacterApplicationService],
})
export class CharacterModule {}

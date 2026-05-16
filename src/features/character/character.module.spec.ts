import 'reflect-metadata';

jest.mock('./application', () => ({
   CharacterApplicationService: class CharacterApplicationService {},
   CreateCharacterApplicationService: class CreateCharacterApplicationService {},
   DeleteCharacterApplicationService: class DeleteCharacterApplicationService {},
   ListCharacterApplicationService: class ListCharacterApplicationService {},
   UpdateCharacterBaseAttributesApplicationService: class UpdateCharacterBaseAttributesApplicationService {},
}));
jest.mock('src/infrastructure/persistence/persistence.module', () => ({
   PersistenceModule: class PersistenceModule {},
}));

import { CharacterModule } from './character.module';
import {
   CharacterApplicationService,
   CreateCharacterApplicationService,
   DeleteCharacterApplicationService,
   ListCharacterApplicationService,
   UpdateCharacterBaseAttributesApplicationService,
} from './application';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';

describe('CharacterModule', () => {
   it('registers imports, providers, and exports', () => {
      expect(Reflect.getMetadata('imports', CharacterModule)).toEqual([PersistenceModule]);
      expect(Reflect.getMetadata('providers', CharacterModule)).toEqual([
         CharacterApplicationService,
         CreateCharacterApplicationService,
         DeleteCharacterApplicationService,
         ListCharacterApplicationService,
         UpdateCharacterBaseAttributesApplicationService,
      ]);
      expect(Reflect.getMetadata('exports', CharacterModule)).toEqual([CharacterApplicationService]);
   });
});

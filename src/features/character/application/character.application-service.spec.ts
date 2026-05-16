jest.mock('./create', () => ({
   CreateCharacterApplicationService: class CreateCharacterApplicationService {},
   CreateCharacterDto: class CreateCharacterDto {},
}));
jest.mock('./delete', () => ({
   DeleteCharacterApplicationService: class DeleteCharacterApplicationService {},
}));
jest.mock('./list', () => ({
   ListCharacterApplicationService: class ListCharacterApplicationService {},
}));
jest.mock('./update-base-attributes', () => ({
   UpdateCharacterBaseAttributesApplicationService: class UpdateCharacterBaseAttributesApplicationService {},
   UpdateCharacterBaseAttributesDto: class UpdateCharacterBaseAttributesDto {},
}));

import { CharacterApplicationService } from './character.application-service';

describe('CharacterApplicationService', () => {
   it('delegates create/list/delete/update operations', async () => {
      const createCharacterApplicationService = {
         createCharacter: jest.fn().mockResolvedValue(['', 'character-1']),
      };
      const deleteCharacterApplicationService = { deleteCharacter: jest.fn().mockResolvedValue('') };
      const listCharacterApplicationService = { listCharacters: jest.fn().mockResolvedValue(['', [{ id: 'c1' }]]) };
      const updateCharacterBaseAttributesApplicationService = {
         updateBaseAttributes: jest.fn().mockResolvedValue(['', { hp: 100 }]),
      };
      const service = new CharacterApplicationService(
         createCharacterApplicationService as any,
         deleteCharacterApplicationService as any,
         listCharacterApplicationService as any,
         updateCharacterBaseAttributesApplicationService as any,
      );
      const createDto = { name: 'Knight' } as any;
      const updateDto = { health: 10 } as any;

      await expect(service.createCharacter(createDto, 'session-1')).resolves.toEqual(['', 'character-1']);
      await expect(service.listCharacters('session-1')).resolves.toEqual(['', [{ id: 'c1' }]]);
      await expect(service.deleteCharacter('character-1', 'session-1')).resolves.toEqual('');
      await expect(service.updateCharacterBaseAttributes('character-1', updateDto, 'session-1')).resolves.toEqual([
         '',
         { hp: 100 },
      ]);

      expect(createCharacterApplicationService.createCharacter).toHaveBeenCalledWith(createDto, 'session-1');
      expect(listCharacterApplicationService.listCharacters).toHaveBeenCalledWith('session-1');
      expect(deleteCharacterApplicationService.deleteCharacter).toHaveBeenCalledWith('character-1', 'session-1');
      expect(updateCharacterBaseAttributesApplicationService.updateBaseAttributes).toHaveBeenCalledWith(
         'character-1',
         updateDto,
         'session-1',
      );
   });
});

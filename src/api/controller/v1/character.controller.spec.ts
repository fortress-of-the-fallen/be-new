jest.mock('src/features/character/application', () => ({
   CharacterApplicationService: class CharacterApplicationService {},
   CreateCharacterDto: class CreateCharacterDto {},
   UpdateCharacterBaseAttributesDto: class UpdateCharacterBaseAttributesDto {},
}));

import { CreateCharacterDto, UpdateCharacterBaseAttributesDto } from 'src/features/character/application';
import { CharacterController } from './character.controller';

describe('CharacterController', () => {
   it('createCharacter returns result on success using bearer token', async () => {
      const characterApplicationService = {
         createCharacter: jest.fn().mockResolvedValue(['', 'character-1']),
      };
      const controller = new CharacterController(characterApplicationService as any);
      const req = { name: 'Knight', characterClass: 'warrior' } as any;
      const request = { headers: { authorization: 'Bearer access-123' } } as any;

      const result = await controller.createCharacter(req, request);

      const dto = characterApplicationService.createCharacter.mock.calls[0][0];
      expect(dto).toBeInstanceOf(CreateCharacterDto);
      expect(dto).toMatchObject(req);
      expect(characterApplicationService.createCharacter).toHaveBeenCalledWith(dto, 'access-123');
      expect(result.success).toBe(true);
      expect(result.result).toBe('character-1');
   });

   it('createCharacter returns error response on failure', async () => {
      const characterApplicationService = {
         createCharacter: jest.fn().mockResolvedValue(['CHARACTER_CREATE_FAILED', '']),
      };
      const controller = new CharacterController(characterApplicationService as any);
      const request = { headers: { 'session-id': 'session-1' } } as any;

      const result = await controller.createCharacter({} as any, request);

      expect(characterApplicationService.createCharacter).toHaveBeenCalledWith(expect.any(CreateCharacterDto), 'session-1');
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('CHARACTER_CREATE_FAILED');
   });

   it('listCharacters returns result on success', async () => {
      const characterApplicationService = {
         listCharacters: jest.fn().mockResolvedValue(['', [{ id: 'character-1' }]]),
      };
      const controller = new CharacterController(characterApplicationService as any);

      const result = await controller.listCharacters({ headers: { authorization: 'Bearer token-1' } } as any);

      expect(characterApplicationService.listCharacters).toHaveBeenCalledWith('token-1');
      expect(result.success).toBe(true);
      expect(result.result).toEqual([{ id: 'character-1' }]);
   });

   it('listCharacters returns error response on failure', async () => {
      const characterApplicationService = {
         listCharacters: jest.fn().mockResolvedValue(['CHARACTER_LIST_FAILED', []]),
      };
      const controller = new CharacterController(characterApplicationService as any);

      const result = await controller.listCharacters({ headers: { 'session-id': 'session-2' } } as any);

      expect(characterApplicationService.listCharacters).toHaveBeenCalledWith('session-2');
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('CHARACTER_LIST_FAILED');
   });

   it('deleteCharacter returns success execution response', async () => {
      const characterApplicationService = {
         deleteCharacter: jest.fn().mockResolvedValue(''),
      };
      const controller = new CharacterController(characterApplicationService as any);

      const result = await controller.deleteCharacter(
         { characterId: 'character-1' } as any,
         { headers: { authorization: 'Bearer token-2' } } as any,
      );

      expect(characterApplicationService.deleteCharacter).toHaveBeenCalledWith('character-1', 'token-2');
      expect(result.success).toBe(true);
   });

   it('deleteCharacter returns error execution response on failure', async () => {
      const characterApplicationService = {
         deleteCharacter: jest.fn().mockResolvedValue('CHARACTER_DELETE_FAILED'),
      };
      const controller = new CharacterController(characterApplicationService as any);

      const result = await controller.deleteCharacter(
         { characterId: 'character-1' } as any,
         { headers: { 'session-id': 'session-3' } } as any,
      );

      expect(characterApplicationService.deleteCharacter).toHaveBeenCalledWith('character-1', 'session-3');
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('CHARACTER_DELETE_FAILED');
   });

   it('updateBaseAttributes returns result on success', async () => {
      const characterApplicationService = {
         updateCharacterBaseAttributes: jest.fn().mockResolvedValue(['', { hp: 100 }]),
      };
      const controller = new CharacterController(characterApplicationService as any);
      const body = { strength: 10, agility: 8 } as any;

      const result = await controller.updateBaseAttributes(
         { characterId: 'character-1' } as any,
         body,
         { headers: { authorization: 'Bearer token-4' } } as any,
      );

      const dto = characterApplicationService.updateCharacterBaseAttributes.mock.calls[0][1];
      expect(dto).toBeInstanceOf(UpdateCharacterBaseAttributesDto);
      expect(dto).toMatchObject(body);
      expect(characterApplicationService.updateCharacterBaseAttributes).toHaveBeenCalledWith(
         'character-1',
         dto,
         'token-4',
      );
      expect(result.success).toBe(true);
      expect(result.result).toEqual({ hp: 100 });
   });

   it('updateBaseAttributes returns error response on failure', async () => {
      const characterApplicationService = {
         updateCharacterBaseAttributes: jest.fn().mockResolvedValue(['CHARACTER_UPDATE_FAILED', null]),
      };
      const controller = new CharacterController(characterApplicationService as any);

      const result = await controller.updateBaseAttributes(
         { characterId: 'character-1' } as any,
         {} as any,
         { headers: { 'session-id': 'session-4' } } as any,
      );

      expect(characterApplicationService.updateCharacterBaseAttributes).toHaveBeenCalledWith(
         'character-1',
         expect.any(UpdateCharacterBaseAttributesDto),
         'session-4',
      );
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('CHARACTER_UPDATE_FAILED');
   });
});

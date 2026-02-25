export class CharacterControllerMessage {
   static readonly Create = {
      CHARACTER_NAME_EXISTS: 'Character.Create.CharacterNameExists',
      INVALID_GENDER: 'Character.Create.InvalidGender',
      USER_NOT_FOUND: 'Character.Create.UserNotFound',
      MAX_CHARACTER_REACHED: 'Character.Create.MaxCharacterReached',
   };

   static readonly List = {
      USER_NOT_FOUND: 'Character.List.UserNotFound',
   };
}

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

   static readonly Delete = {
      CHARACTER_ID_REQUIRED: 'Character.Delete.CharacterIdRequired',
      USER_NOT_FOUND: 'Character.Delete.UserNotFound',
      CHARACTER_NOT_FOUND: 'Character.Delete.CharacterNotFound',
   };

   static readonly UpdateBaseAttributes = {
      CHARACTER_ID_REQUIRED: 'Character.UpdateBaseAttributes.CharacterIdRequired',
      USER_NOT_FOUND: 'Character.UpdateBaseAttributes.UserNotFound',
      CHARACTER_NOT_FOUND: 'Character.UpdateBaseAttributes.CharacterNotFound',
      STATS_NOT_FOUND: 'Character.UpdateBaseAttributes.StatsNotFound',
      NO_ATTRIBUTE_TO_UPDATE: 'Character.UpdateBaseAttributes.NoAttributeToUpdate',
      INVALID_ATTRIBUTE_VALUE: 'Character.UpdateBaseAttributes.InvalidAttributeValue',
      INSUFFICIENT_UNSPENT_POINTS: 'Character.UpdateBaseAttributes.InsufficientUnspentPoints',
   };
}

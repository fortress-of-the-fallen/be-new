export class GameUserControllerMessage {
   static readonly Create = {
      CHARACTER_NAME_EXISTS: 'GameUser.Create.CharacterNameExists',
      INVALID_GENDER: 'GameUser.Create.InvalidGender',
      USER_NOT_FOUND: 'GameUser.Create.UserNotFound',
      MAX_GAME_USER_REACHED: 'GameUser.Create.MaxGameUserReached',
   };

   static readonly List = {
      USER_NOT_FOUND: 'GameUser.List.UserNotFound',
   };
}

export class AuthControllerMessage {
   static readonly Register = {
      PASSWORD_MISMATCH: 'Auth.Register.PasswordMismatch',
      USERNAME_EXISTS: 'Auth.Register.UsernameExists',
   };

   static readonly Login = {
      USER_NOT_FOUND: 'Auth.Login.UserNotFound',
      INVALID_CREDENTIALS: 'Auth.Login.InvalidCredentials',
      MAX_SESSION_REACHED: 'Auth.Login.MaxSessionReached',
      CLIENT_NOT_CONNECTED: 'Auth.Login.ClientNotConnected',
   };

   static readonly Logout = {
      SESSION_ID_REQUIRED: 'Auth.Logout.SessionIdRequired',
      USER_NOT_FOUND: 'Auth.Logout.UserNotFound',
      SESSION_NOT_FOUND: 'Auth.Logout.SessionNotFound',
   };
}

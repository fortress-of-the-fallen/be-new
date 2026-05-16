import { AuthControllerMessage } from './auth-controller.message';

describe('AuthControllerMessage', () => {
   it('exposes register, login, and logout message keys', () => {
      expect(AuthControllerMessage.Register).toEqual({
         PASSWORD_MISMATCH: 'Auth.Register.PasswordMismatch',
         USERNAME_EXISTS: 'Auth.Register.UsernameExists',
         EMAIL_EXISTS: 'Auth.Register.EmailExists',
      });
      expect(AuthControllerMessage.Login).toEqual({
         USER_NOT_FOUND: 'Auth.Login.UserNotFound',
         INVALID_CREDENTIALS: 'Auth.Login.InvalidCredentials',
         MAX_SESSION_REACHED: 'Auth.Login.MaxSessionReached',
         CLIENT_NOT_CONNECTED: 'Auth.Login.ClientNotConnected',
      });
      expect(AuthControllerMessage.Logout).toEqual({
         SESSION_ID_REQUIRED: 'Auth.Logout.SessionIdRequired',
         USER_NOT_FOUND: 'Auth.Logout.UserNotFound',
         SESSION_NOT_FOUND: 'Auth.Logout.SessionNotFound',
      });
   });
});

jest.mock('./register', () => ({
   AuthRegisterDto: class AuthRegisterDto {},
   RegisterApplicationService: class RegisterApplicationService {},
}));
jest.mock('./login', () => ({
   AuthLoginDto: class AuthLoginDto {},
   LoginApplicationService: class LoginApplicationService {},
}));
jest.mock('./logout', () => ({
   LogoutApplicationService: class LogoutApplicationService {},
}));
jest.mock('./refresh', () => ({
   RefreshApplicationService: class RefreshApplicationService {},
}));

import { AuthApplicationService } from './auth.application-service';

describe('AuthApplicationService', () => {
   it('delegates register/login/refresh/logout to underlying services', async () => {
      const registerApplicationService = { register: jest.fn().mockResolvedValue({ kind: 'register' }) };
      const loginApplicationService = { login: jest.fn().mockResolvedValue({ kind: 'login' }) };
      const refreshApplicationService = { refresh: jest.fn().mockResolvedValue({ kind: 'refresh' }) };
      const logoutApplicationService = { logout: jest.fn().mockResolvedValue({ kind: 'logout' }) };
      const service = new AuthApplicationService(
         registerApplicationService as any,
         loginApplicationService as any,
         refreshApplicationService as any,
         logoutApplicationService as any,
      );
      const request = { ip: '127.0.0.1' } as any;
      const authContext = { playerId: 'player-1' } as any;
      const registerDto = { username: 'u1' } as any;
      const loginDto = { username: 'u1' } as any;

      await expect(service.register(registerDto, request)).resolves.toEqual({ kind: 'register' });
      await expect(service.login(loginDto, request)).resolves.toEqual({ kind: 'login' });
      await expect(service.refresh('refresh-token', request)).resolves.toEqual({ kind: 'refresh' });
      await expect(service.logout(authContext, 'refresh-token')).resolves.toEqual({ kind: 'logout' });

      expect(registerApplicationService.register).toHaveBeenCalledWith(registerDto, request);
      expect(loginApplicationService.login).toHaveBeenCalledWith(loginDto, request);
      expect(refreshApplicationService.refresh).toHaveBeenCalledWith('refresh-token', request);
      expect(logoutApplicationService.logout).toHaveBeenCalledWith(authContext, 'refresh-token');
   });
});

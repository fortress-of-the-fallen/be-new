jest.mock('src/features/auth/application/login', () => ({
   AuthLoginDto: class AuthLoginDto {},
}));
jest.mock('src/features/auth/application/register', () => ({
   AuthRegisterDto: class AuthRegisterDto {},
}));
jest.mock('src/features/auth/application/auth.application-service', () => ({
   AuthApplicationService: class AuthApplicationService {},
}));

import { AuthLoginDto } from 'src/features/auth/application/login';
import { AuthRegisterDto } from 'src/features/auth/application/register';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
   it('register delegates with AuthRegisterDto and wraps response', async () => {
      const authApplicationService = { register: jest.fn().mockResolvedValue({ accessToken: 'token-1' }) };
      const controller = new AuthController(authApplicationService as any);
      const req = { username: 'hero', password: 'secret' } as any;
      const request = { headers: {} } as any;

      const result = await controller.register(req, request);

      const dto = authApplicationService.register.mock.calls[0][0];
      expect(dto).toBeInstanceOf(AuthRegisterDto);
      expect(dto).toMatchObject(req);
      expect(authApplicationService.register).toHaveBeenCalledWith(dto, request);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ accessToken: 'token-1' });
      expect(typeof result.serverTime).toBe('string');
   });

   it('login delegates with AuthLoginDto and wraps response', async () => {
      const authApplicationService = { login: jest.fn().mockResolvedValue({ accessToken: 'token-2' }) };
      const controller = new AuthController(authApplicationService as any);
      const req = { username: 'hero', password: 'secret', rememberMe: true } as any;
      const request = { ip: '127.0.0.1' } as any;

      const result = await controller.login(req, request);

      const dto = authApplicationService.login.mock.calls[0][0];
      expect(dto).toBeInstanceOf(AuthLoginDto);
      expect(dto).toMatchObject(req);
      expect(authApplicationService.login).toHaveBeenCalledWith(dto, request);
      expect(result.data).toEqual({ accessToken: 'token-2' });
   });

   it('refresh delegates refreshToken and wraps response', async () => {
      const authApplicationService = { refresh: jest.fn().mockResolvedValue({ accessToken: 'token-3' }) };
      const controller = new AuthController(authApplicationService as any);
      const request = { headers: {} } as any;

      const result = await controller.refresh({ refreshToken: 'refresh-1' } as any, request);

      expect(authApplicationService.refresh).toHaveBeenCalledWith('refresh-1', request);
      expect(result.data).toEqual({ accessToken: 'token-3' });
   });

   it('logout delegates auth context and refresh token then wraps response', async () => {
      const authApplicationService = { logout: jest.fn().mockResolvedValue({ revoked: true }) };
      const controller = new AuthController(authApplicationService as any);
      const authContext = { playerId: 'p1' } as any;

      const result = await controller.logout(authContext, { refreshToken: 'refresh-2' } as any);

      expect(authApplicationService.logout).toHaveBeenCalledWith(authContext, 'refresh-2');
      expect(result.data).toEqual({ revoked: true });
   });
});

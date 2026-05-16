import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthRegisterDto, RegisterApplicationService } from './register';
import { AuthLoginDto, LoginApplicationService } from './login';
import { LogoutApplicationService } from './logout';
import { RefreshApplicationService } from './refresh';
import { RequestAuthContext } from 'src/shared/services/auth/auth-context';

@Injectable()
export class AuthApplicationService {
   constructor(
      private readonly registerApplicationService: RegisterApplicationService,
      private readonly loginApplicationService: LoginApplicationService,
      private readonly refreshApplicationService: RefreshApplicationService,
      private readonly logoutApplicationService: LogoutApplicationService,
   ) {}

   async register(reqDto: AuthRegisterDto, request?: Request) {
      return this.registerApplicationService.register(reqDto, request);
   }

   async login(loginReqDto: AuthLoginDto, request?: Request) {
      return this.loginApplicationService.login(loginReqDto, request);
   }

   async refresh(refreshToken: string, request?: Request) {
      return this.refreshApplicationService.refresh(refreshToken, request);
   }

   async logout(authContext: RequestAuthContext, refreshToken: string) {
      return this.logoutApplicationService.logout(authContext, refreshToken);
   }
}

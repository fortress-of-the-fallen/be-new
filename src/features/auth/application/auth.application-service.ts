import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthRegisterDto, RegisterApplicationService } from './register';
import { AuthLoginDto, LoginApplicationService } from './login';
import { LogoutApplicationService } from './logout';

@Injectable()
export class AuthApplicationService {
   constructor(
      private readonly registerApplicationService: RegisterApplicationService,
      private readonly loginApplicationService: LoginApplicationService,
      private readonly logoutApplicationService: LogoutApplicationService,
   ) {}

   async register(reqDto: AuthRegisterDto): Promise<[string, string]> {
      return this.registerApplicationService.register(reqDto);
   }

   async login(loginReqDto: AuthLoginDto, request?: Request): Promise<[string, string]> {
      return this.loginApplicationService.login(loginReqDto, request);
   }

   async logout(sessionId: string | undefined): Promise<string> {
      return this.logoutApplicationService.logout(sessionId);
   }
}

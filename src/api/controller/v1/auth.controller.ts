import { Body, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthLoginDto } from 'src/features/auth/application/login';
import { AuthRegisterDto } from 'src/features/auth/application/register';
import { AuthApplicationService } from 'src/features/auth/application/auth.application-service';
import { Controllers } from 'src/shared/decorator/controller.decorator';
import { RateLimit } from 'src/shared/decorator/rate-limit.decorator';
import { Roles } from 'src/shared/decorator/role.decorator';
import { AllRoles } from 'src/features/auth/application/role-base.enum';
import { LoginReq } from 'src/api/model/req/auth/login-req.model';
import { RegisterReq } from 'src/api/model/req/auth/register-req.model';
import { RefreshReq } from 'src/api/model/req/auth/refresh-req.model';
import { LogoutReq } from 'src/api/model/req/auth/logout-req.model';
import { buildSuccessResponse } from 'src/api/model/res/base/api-envelope.model';
import { Request } from 'express';
import { CurrentAuth } from 'src/shared/decorator/current-auth.decorator';
import { RequestAuthContext } from 'src/shared/services/auth/auth-context';

@ApiTags('Auth')
@Controllers({ path: 'auth', version: '1' })
export class AuthController {
   constructor(private readonly authApplicationService: AuthApplicationService) {}

   @Post('register')
   @ApiOperation({ summary: 'Register user' })
   @RateLimit({ limit: 5, ttl: 60 })
   @ApiOkResponse({
      description: 'Returns auth tokens and player info',
   })
   async register(@Body() req: RegisterReq, @Req() request: Request) {
      const dto = Object.assign(new AuthRegisterDto(), req);
      return buildSuccessResponse(await this.authApplicationService.register(dto, request));
   }

   @Post('login')
   @ApiOperation({ summary: 'Login user' })
   @ApiOkResponse({
      description: 'Returns auth tokens and player info',
   })
   @RateLimit({ limit: 5, ttl: 60 })
   async login(@Body() req: LoginReq, @Req() request: Request) {
      const dto = Object.assign(new AuthLoginDto(), req);
      return buildSuccessResponse(await this.authApplicationService.login(dto, request));
   }

   @Post('refresh')
   @ApiOperation({ summary: 'Refresh access token' })
   @ApiOkResponse({
      description: 'Returns a rotated access token pair',
   })
   @RateLimit({ limit: 5, ttl: 60 })
   async refresh(@Body() req: RefreshReq, @Req() request: Request) {
      return buildSuccessResponse(
         await this.authApplicationService.refresh(req.refreshToken, request),
      );
   }

   @Post('logout')
   @ApiOperation({ summary: 'Logout current session' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({
      description: 'Revokes the current refresh session',
   })
   @RateLimit({ limit: 5, ttl: 60 })
   @Roles(...AllRoles)
   async logout(
      @CurrentAuth() authContext: RequestAuthContext,
      @Body() req: LogoutReq,
   ) {
      return buildSuccessResponse(
         await this.authApplicationService.logout(authContext, req.refreshToken),
      );
   }
}

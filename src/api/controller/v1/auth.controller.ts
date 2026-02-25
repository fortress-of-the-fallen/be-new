import { Body, Delete, Headers, Post, Req } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthLoginDto } from 'src/features/auth/application/login';
import { AuthRegisterDto } from 'src/features/auth/application/register';
import { AuthApplicationService } from 'src/features/auth/application/auth.application-service';
import { ApiErrorMessages } from 'src/shared/decorator/api-error-message.decorator';
import { AuthControllerMessage } from 'src/features/auth/application/auth-controller.message';
import { Controllers } from 'src/shared/decorator/controller.decorator';
import { RateLimit } from 'src/shared/decorator/rate-limit.decorator';
import { Roles } from 'src/shared/decorator/role.decorator';
import { AllRoles } from 'src/features/auth/application/role-base.enum';
import { isNullOrEmpty } from 'src/shared/helper/string.helper';
import { LoginReq } from 'src/api/model/req/auth/login-req.model';
import { RegisterReq } from 'src/api/model/req/auth/register-req.model';
import { ExecutionRes } from 'src/api/model/res/base/execution-res.model';
import { ResultRes } from 'src/api/model/res/base/result-res.model';
import { Request } from 'express';

@ApiTags('Auth')
@Controllers({ path: 'auth', version: '1' })
export class AuthController {
   constructor(private readonly authApplicationService: AuthApplicationService) {}

   @Post('register')
   @ApiOperation({ summary: 'Register user' })
   @RateLimit({ limit: 5, ttl: 60 })
   @ApiErrorMessages(AuthControllerMessage.Register)
   @ApiOkResponse({
      type: ResultRes<string>,
      description: 'Returns execution result',
   })
   async register(@Body() req: RegisterReq): Promise<ResultRes<string>> {
      const response: ResultRes<string> = new ResultRes<string>();
      const dto = Object.assign(new AuthRegisterDto(), req);

      const [error, result]: [string, string] = await this.authApplicationService.register(dto);

      if (!isNullOrEmpty(error)) {
         response.success = false;
         response.errorCode = error;
         return response;
      }

      response.result = result;
      return response;
   }

   @Post('login')
   @ApiOperation({ summary: 'Login user' })
   @ApiOkResponse({
      type: ResultRes<string>,
      description: 'Returns execution result',
   })
   @ApiErrorMessages(AuthControllerMessage.Login)
   @RateLimit({ limit: 5, ttl: 60 })
   async login(@Body() req: LoginReq, @Req() request: Request): Promise<ResultRes<string>> {
      const response: ResultRes<string> = new ResultRes<string>();
      const dto = Object.assign(new AuthLoginDto(), req);

      const [error, result]: [string, string] = await this.authApplicationService.login(
         dto,
         request,
      );

      if (!isNullOrEmpty(error)) {
         response.success = false;
         response.errorCode = error;
         return response;
      }

      response.result = result;
      return response;
   }

   @Delete('logout')
   @ApiOperation({ summary: 'Logout user' })
   @ApiHeader({
      name: 'session-id',
      description: 'Session ID for the user',
      required: true,
   })
   @ApiOkResponse({
      type: ExecutionRes,
      description: 'Returns execution result',
   })
   @ApiErrorMessages(AuthControllerMessage.Logout)
   @RateLimit({ limit: 5, ttl: 60 })
   @Roles(...AllRoles)
   async logout(@Headers('session-id') sessionId?: string): Promise<ExecutionRes> {
      const response: ExecutionRes = new ExecutionRes();

      const error: string = await this.authApplicationService.logout(sessionId);

      if (!isNullOrEmpty(error)) {
         response.success = false;
         response.errorCode = error;
         return response;
      }

      response.success = true;
      return response;
   }
}

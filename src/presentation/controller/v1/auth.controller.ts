import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Delete, Get, Inject, Post } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginReqDto } from 'src/application/feature/auth/command/login-command/login-command-req.dto';
import { LoginCommand } from 'src/application/feature/auth/command/login-command/login-command.feature';
import { LogoutCommand } from 'src/application/feature/auth/command/logout-command/logout-command.feature';
import { RegisterReqDto } from 'src/application/feature/auth/command/register-command/register-command-req.dto';
import { RegisterCommand } from 'src/application/feature/auth/command/register-command/register-command.feature';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { IMediator } from 'src/application/interface/mediator/i-mediator';
import { Controllers } from 'src/domain/decorator/controller.decorator';
import { RateLimit } from 'src/domain/decorator/rate-limit.decorator';
import { Roles } from 'src/domain/decorator/role.decorator';
import { AllRoles } from 'src/domain/enum/role-base.enum';
import { isNullOrEmpty } from 'src/domain/helper/string.helper';
import { LoginReq } from 'src/presentation/model/req/auth/login-req.model';
import { RegisterReq } from 'src/presentation/model/req/auth/register-req.model';
import { ExecutionRes } from 'src/presentation/model/res/base/execution-res.model';
import { ResultRes } from 'src/presentation/model/res/base/result-res.model';

@ApiTags('Auth')
@Controllers({ path: 'auth', version: '1' })
export class AuthController {
   constructor(
      @Inject(ILogger)
      private readonly logger: ILogger,

      @Inject(IMediator)
      private readonly mediator: IMediator,

      @InjectMapper()
      private readonly mapper: Mapper,
   ) {}

   @Get('github-login')
   @ApiOperation({ summary: 'Github login' })
   @RateLimit({ limit: 5, ttl: 60 })
   @ApiResponse({ status: 400.1, description: 'Returns the sample list' })
   async getSamples(): Promise<string> {
      // const response: ExecutionRes = new ExecutionRes(); // Changed to English: // const response: ExecutionRes = new ExecutionRes();

      return 'response';
   }

   @Post('register')
   @ApiOperation({ summary: 'Register user' })
   @RateLimit({ limit: 5, ttl: 60 })
   @ApiOkResponse({
      type: ResultRes<string>,
      description: 'Returns execution result',
   })
   async register(@Body() req: RegisterReq): Promise<ResultRes<string>> {
      const response: ResultRes<string> = new ResultRes<string>();

      const [error, result]: [string, string] = await this.mediator.send(
         new RegisterCommand(this.mapper.map(req, RegisterReq, RegisterReqDto)),
      );

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
   @RateLimit({ limit: 5, ttl: 60 })
   async login(@Body() req: LoginReq): Promise<ResultRes<string>> {
      const response: ResultRes<string> = new ResultRes<string>();

      const [error, result]: [string, string] = await this.mediator.send(
         new LoginCommand(this.mapper.map(req, LoginReq, LoginReqDto)),
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
   @RateLimit({ limit: 5, ttl: 60 })
   @Roles(...AllRoles)
   async logout(): Promise<ExecutionRes> {
      const response: ExecutionRes = new ExecutionRes();

      const error: string = await this.mediator.send(new LogoutCommand());

      if (!isNullOrEmpty(error)) {
         response.success = false;
         response.errorCode = error;
         return response;
      }

      response.success = true;
      return response;
   }
}

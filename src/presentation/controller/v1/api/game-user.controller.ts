import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Inject, Post } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateGameUserCommand } from 'src/application/feature/game-user/command/create-game-user-command/create-game-user-command.feature';
import { CreateGameUserReqDto } from 'src/application/feature/game-user/command/create-game-user-command/create-game-user-command-req.dto';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { IMediator } from 'src/application/interface/mediator/i-mediator';
import { ApiErrorMessages } from 'src/domain/decorator/api-error-message.decorator';
import { GameUserControllerMessage } from 'src/domain/message/game-user-controller.message';
import { Controllers } from 'src/domain/decorator/controller.decorator';
import { RateLimit } from 'src/domain/decorator/rate-limit.decorator';
import { Roles } from 'src/domain/decorator/role.decorator';
import { AllRoles } from 'src/domain/enum/role-base.enum';
import { isNullOrEmpty } from 'src/domain/helper/string.helper';
import { CreateGameUserReq } from 'src/presentation/model/req/game-user/create-game-user-req.model';
import { ResultRes } from 'src/presentation/model/res/base/result-res.model';

@ApiTags('Game User')
@Controllers({ path: 'api/game-user', version: '1' })
export class GameUserController {
   constructor(
      @Inject(ILogger)
      private readonly logger: ILogger,

      @Inject(IMediator)
      private readonly mediator: IMediator,

      @InjectMapper()
      private readonly mapper: Mapper,
   ) {}

   @Post()
   @ApiOperation({ summary: 'Create game user character' })
   @ApiHeader({
      name: 'session-id',
      description: 'Session ID for the user',
      required: true,
   })
   @ApiOkResponse({
      type: ResultRes<string>,
      description: 'Returns created game user ID',
   })
   @ApiErrorMessages(GameUserControllerMessage.Create)
   @RateLimit({ limit: 5, ttl: 60 })
   @Roles(...AllRoles)
   async createGameUser(@Body() req: CreateGameUserReq): Promise<ResultRes<string>> {
      const response: ResultRes<string> = new ResultRes<string>();

      const [error, result]: [string, string] = await this.mediator.send(
         new CreateGameUserCommand(this.mapper.map(req, CreateGameUserReq, CreateGameUserReqDto)),
      );

      if (!isNullOrEmpty(error)) {
         response.success = false;
         response.errorCode = error;
         return response;
      }

      response.result = result;
      return response;
   }
}

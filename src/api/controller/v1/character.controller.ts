import { Body, Delete, Get, Headers, Param, Post } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiErrorMessages } from 'src/shared/decorator/api-error-message.decorator';
import { CharacterControllerMessage } from 'src/features/character/application/character-controller.message';
import { Controllers } from 'src/shared/decorator/controller.decorator';
import { RateLimit } from 'src/shared/decorator/rate-limit.decorator';
import { Roles } from 'src/shared/decorator/role.decorator';
import { AllRoles } from 'src/features/auth/application/role-base.enum';
import { isNullOrEmpty } from 'src/shared/helper/string.helper';
import { CreateCharacterReq } from 'src/api/model/req/character/create-character-req.model';
import { DeleteCharacterReq } from 'src/api/model/req/character/delete-character-req.model';
import { CharacterRes } from 'src/api/model/res/character/character-res.model';
import { ExecutionRes } from 'src/api/model/res/base/execution-res.model';
import { ResultRes } from 'src/api/model/res/base/result-res.model';
import { CharacterApplicationService, CreateCharacterDto } from 'src/features/character/application';

@ApiTags('Character')
@Controllers({ path: 'api/character', version: '1' })
export class CharacterController {
   constructor(private readonly characterApplicationService: CharacterApplicationService) {}

   @Post()
   @ApiOperation({ summary: 'Create character' })
   @ApiHeader({
      name: 'session-id',
      description: 'Session ID for the user',
      required: true,
   })
   @ApiOkResponse({
      type: ResultRes<string>,
      description: 'Returns created character ID',
   })
   @ApiErrorMessages(CharacterControllerMessage.Create)
   @RateLimit({ limit: 5, ttl: 60 })
   @Roles(...AllRoles)
   async createCharacter(
      @Body() req: CreateCharacterReq,
      @Headers('session-id') sessionId?: string,
   ): Promise<ResultRes<string>> {
      const response: ResultRes<string> = new ResultRes<string>();
      const reqDto = Object.assign(new CreateCharacterDto(), req);

      const [error, result]: [string, string] =
         await this.characterApplicationService.createCharacter(reqDto, sessionId);

      if (!isNullOrEmpty(error)) {
         response.success = false;
         response.errorCode = error;
         return response;
      }

      response.result = result;
      return response;
   }

   @Get()
   @ApiOperation({ summary: 'Get list of characters for current user' })
   @ApiHeader({
      name: 'session-id',
      description: 'Session ID for the user',
      required: true,
   })
   @ApiOkResponse({
      type: ResultRes<CharacterRes[]>,
      description: 'Returns list of characters',
   })
   @ApiErrorMessages(CharacterControllerMessage.List)
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async listCharacters(
      @Headers('session-id') sessionId?: string,
   ): Promise<ResultRes<CharacterRes[]>> {
      const response: ResultRes<CharacterRes[]> = new ResultRes<CharacterRes[]>();

      const [error, result]: [string, any[]] =
         await this.characterApplicationService.listCharacters(sessionId);

      if (!isNullOrEmpty(error)) {
         response.success = false;
         response.errorCode = error;
         return response;
      }

      response.result = result;
      return response;
   }

   @Delete(':characterId')
   @ApiOperation({ summary: 'Delete character' })
   @ApiHeader({
      name: 'session-id',
      description: 'Session ID for the user',
      required: true,
   })
   @ApiParam({
      name: 'characterId',
      required: true,
      description: 'Character ID to delete',
   })
   @ApiOkResponse({
      type: ExecutionRes,
      description: 'Returns execution result',
   })
   @ApiErrorMessages(CharacterControllerMessage.Delete)
   @RateLimit({ limit: 5, ttl: 60 })
   @Roles(...AllRoles)
   async deleteCharacter(
      @Param() req: DeleteCharacterReq,
      @Headers('session-id') sessionId?: string,
   ): Promise<ExecutionRes> {
      const response: ExecutionRes = new ExecutionRes();

      const error: string = await this.characterApplicationService.deleteCharacter(
         req.characterId,
         sessionId,
      );

      if (!isNullOrEmpty(error)) {
         response.success = false;
         response.errorCode = error;
         return response;
      }

      response.success = true;
      return response;
   }
}

import { Body, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiErrorMessages } from 'src/shared/decorator/api-error-message.decorator';
import { CharacterControllerMessage } from 'src/features/character/application/character-controller.message';
import { Controllers } from 'src/shared/decorator/controller.decorator';
import { RateLimit } from 'src/shared/decorator/rate-limit.decorator';
import { Roles } from 'src/shared/decorator/role.decorator';
import { AllRoles } from 'src/features/auth/application/role-base.enum';
import { isNullOrEmpty } from 'src/shared/helper/string.helper';
import { CreateCharacterReq } from 'src/api/model/req/character/create-character-req.model';
import { DeleteCharacterReq } from 'src/api/model/req/character/delete-character-req.model';
import { UpdateCharacterBaseAttributesReq } from 'src/api/model/req/character/update-character-base-attributes-req.model';
import { CharacterRes, CharacterStatsRes } from 'src/api/model/res/character/character-res.model';
import { ExecutionRes } from 'src/api/model/res/base/execution-res.model';
import { ResultRes } from 'src/api/model/res/base/result-res.model';
import {
   CharacterApplicationService,
   CreateCharacterDto,
   UpdateCharacterBaseAttributesDto,
} from 'src/features/character/application';
import { extractRequestToken } from 'src/shared/helper/request-auth.helper';
import { Request } from 'express';

@ApiTags('Character')
@Controllers({ path: 'character', version: '1' })
export class CharacterController {
   constructor(private readonly characterApplicationService: CharacterApplicationService) {}

   @Post()
   @ApiOperation({ summary: 'Create character' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({
      type: ResultRes<string>,
      description: 'Returns created character ID',
   })
   @ApiErrorMessages(CharacterControllerMessage.Create)
   @RateLimit({ limit: 5, ttl: 60 })
   @Roles(...AllRoles)
   async createCharacter(
      @Body() req: CreateCharacterReq,
      @Req() request: Request,
   ): Promise<ResultRes<string>> {
      const response: ResultRes<string> = new ResultRes<string>();
      const reqDto = Object.assign(new CreateCharacterDto(), req);
      const sessionId = extractRequestToken(request.headers as Record<string, unknown>);

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
   @ApiBearerAuth('access-token')
   @ApiOkResponse({
      type: ResultRes<CharacterRes[]>,
      description: 'Returns list of characters',
   })
   @ApiErrorMessages(CharacterControllerMessage.List)
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async listCharacters(@Req() request: Request): Promise<ResultRes<CharacterRes[]>> {
      const response: ResultRes<CharacterRes[]> = new ResultRes<CharacterRes[]>();
      const sessionId = extractRequestToken(request.headers as Record<string, unknown>);

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
   @ApiBearerAuth('access-token')
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
      @Req() request: Request,
   ): Promise<ExecutionRes> {
      const response: ExecutionRes = new ExecutionRes();
      const sessionId = extractRequestToken(request.headers as Record<string, unknown>);

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

   @Patch(':characterId/stats/base')
   @ApiOperation({ summary: 'Update base attributes of a character' })
   @ApiBearerAuth('access-token')
   @ApiParam({
      name: 'characterId',
      required: true,
      description: 'Character ID to update stats',
   })
   @ApiOkResponse({
      type: ResultRes<CharacterStatsRes>,
      description: 'Returns updated character stats',
   })
   @ApiErrorMessages(CharacterControllerMessage.UpdateBaseAttributes)
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async updateBaseAttributes(
      @Param() req: DeleteCharacterReq,
      @Body() body: UpdateCharacterBaseAttributesReq,
      @Req() request: Request,
   ): Promise<ResultRes<CharacterStatsRes>> {
      const response: ResultRes<CharacterStatsRes> = new ResultRes<CharacterStatsRes>();
      const reqDto = Object.assign(new UpdateCharacterBaseAttributesDto(), body);
      const sessionId = extractRequestToken(request.headers as Record<string, unknown>);

      const [error, result] = await this.characterApplicationService.updateCharacterBaseAttributes(
         req.characterId,
         reqDto,
         sessionId,
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

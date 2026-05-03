import { Body, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateFormationReq } from 'src/api/model/req/formation/update-formation-req.model';
import { buildSuccessResponse } from 'src/api/model/res/base/api-envelope.model';
import { AllRoles } from 'src/features/auth/application/role-base.enum';
import { FormationApplicationService, UpdateFormationDto } from 'src/features/formation/application';
import { CurrentAuth } from 'src/shared/decorator/current-auth.decorator';
import { Controllers } from 'src/shared/decorator/controller.decorator';
import { RateLimit } from 'src/shared/decorator/rate-limit.decorator';
import { Roles } from 'src/shared/decorator/role.decorator';
import { RequestAuthContext } from 'src/shared/services/auth/auth-context';

@ApiTags('Formation')
@Controllers({ path: 'formation', version: '1' })
export class FormationController {
   constructor(private readonly formationApplicationService: FormationApplicationService) {}

   @Get()
   @ApiOperation({ summary: 'Get current formation' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns the active formation' })
   @RateLimit({ limit: 20, ttl: 60 })
   @Roles(...AllRoles)
   async getFormation(@CurrentAuth() authContext: RequestAuthContext) {
      return buildSuccessResponse(
         await this.formationApplicationService.getFormation(authContext.playerId),
      );
   }

   @Put()
   @ApiOperation({ summary: 'Replace current formation' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns the updated formation' })
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async updateFormation(
      @CurrentAuth() authContext: RequestAuthContext,
      @Body() req: UpdateFormationReq,
   ) {
      const dto = Object.assign(new UpdateFormationDto(), req);
      return buildSuccessResponse(
         await this.formationApplicationService.updateFormation(authContext.playerId, dto),
      );
   }
}

import { Get, Patch, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { buildSuccessResponse } from 'src/api/model/res/base/api-envelope.model';
import { UpdateProfileReq } from 'src/api/model/req/player/update-profile-req.model';
import { AllRoles } from 'src/features/auth/application/role-base.enum';
import { PlayerApplicationService, UpdateProfileDto } from 'src/features/player/application';
import { CurrentAuth } from 'src/shared/decorator/current-auth.decorator';
import { Controllers } from 'src/shared/decorator/controller.decorator';
import { RateLimit } from 'src/shared/decorator/rate-limit.decorator';
import { Roles } from 'src/shared/decorator/role.decorator';
import { RequestAuthContext } from 'src/shared/services/auth/auth-context';

@ApiTags('Player')
@Controllers({ path: 'me', version: '1' })
export class PlayerController {
   constructor(private readonly playerApplicationService: PlayerApplicationService) {}

   @Get()
   @ApiOperation({ summary: 'Get current player state' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({
      description: 'Returns the current player state',
   })
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async getCurrentPlayer(@CurrentAuth() authContext: RequestAuthContext) {
      return buildSuccessResponse(
         await this.playerApplicationService.getCurrentPlayer(authContext.playerId),
      );
   }

   @Patch('profile')
   @ApiOperation({ summary: 'Update current player profile' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({
      description: 'Returns updated profile and currency',
   })
   @RateLimit({ limit: 5, ttl: 60 })
   @Roles(...AllRoles)
   async updateProfile(
      @CurrentAuth() authContext: RequestAuthContext,
      @Body() req: UpdateProfileReq,
   ) {
      const dto = Object.assign(new UpdateProfileDto(), req);
      return buildSuccessResponse(
         await this.playerApplicationService.updateProfile(authContext.playerId, dto),
      );
   }
}

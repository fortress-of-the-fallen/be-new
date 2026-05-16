import { Body, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigIdempotencyReq } from 'src/api/model/req/common/config-idempotency-req.model';
import { buildSuccessResponse } from 'src/api/model/res/base/api-envelope.model';
import { AllRoles } from 'src/features/auth/application/role-base.enum';
import { LobbyApplicationService } from 'src/features/lobby/application';
import { CurrentAuth } from 'src/shared/decorator/current-auth.decorator';
import { Controllers } from 'src/shared/decorator/controller.decorator';
import { RateLimit } from 'src/shared/decorator/rate-limit.decorator';
import { Roles } from 'src/shared/decorator/role.decorator';
import { RequestAuthContext } from 'src/shared/services/auth/auth-context';

@ApiTags('Lobby')
@Controllers({ path: 'lobby', version: '1' })
export class LobbyController {
   constructor(private readonly lobbyApplicationService: LobbyApplicationService) {}

   @Post('castle/upgrade')
   @ApiOperation({ summary: 'Upgrade castle progression' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns updated castle progression and currency' })
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async upgradeCastle(
      @CurrentAuth() authContext: RequestAuthContext,
      @Body() req: ConfigIdempotencyReq,
   ) {
      return buildSuccessResponse(
         await this.lobbyApplicationService.upgradeCastle(
            authContext.playerId,
            req.configVersion,
            req.idempotencyKey,
         ),
      );
   }
}

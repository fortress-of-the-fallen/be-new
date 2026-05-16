import { Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { buildSuccessResponse } from 'src/api/model/res/base/api-envelope.model';
import { AllRoles } from 'src/features/auth/application/role-base.enum';
import { LeaderboardApplicationService } from 'src/features/leaderboard/application';
import { CurrentAuth } from 'src/shared/decorator/current-auth.decorator';
import { Controllers } from 'src/shared/decorator/controller.decorator';
import { RateLimit } from 'src/shared/decorator/rate-limit.decorator';
import { Roles } from 'src/shared/decorator/role.decorator';
import { RequestAuthContext } from 'src/shared/services/auth/auth-context';

@ApiTags('Leaderboard')
@Controllers({ path: 'matchmaking', version: '1' })
export class MatchmakingController {
   constructor(private readonly leaderboardApplicationService: LeaderboardApplicationService) {}

   @Get('opponents')
   @ApiOperation({ summary: 'Get matchmaking opponents' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns matchmaking candidates' })
   @RateLimit({ limit: 20, ttl: 60 })
   @Roles(...AllRoles)
   async getOpponents(
      @CurrentAuth() authContext: RequestAuthContext,
      @Query('mode') mode = 'PVP',
   ) {
      return buildSuccessResponse(
         await this.leaderboardApplicationService.getOpponents(authContext.playerId, mode),
      );
   }
}

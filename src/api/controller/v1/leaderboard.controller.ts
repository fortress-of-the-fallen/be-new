import { DefaultValuePipe, Get, ParseIntPipe, Param, Query } from '@nestjs/common';
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
@Controllers({ path: 'leaderboards', version: '1' })
export class LeaderboardController {
   constructor(private readonly leaderboardApplicationService: LeaderboardApplicationService) {}

   @Get(':type')
   @ApiOperation({ summary: 'Get leaderboard entries' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns leaderboard entries' })
   @RateLimit({ limit: 20, ttl: 60 })
   @Roles(...AllRoles)
   async getLeaderboard(
      @Param('type') type: 'score' | 'level' | 'campaign',
      @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
   ) {
      return buildSuccessResponse(
         await this.leaderboardApplicationService.getLeaderboard(type, limit),
      );
   }

   @Get(':type/me')
   @ApiOperation({ summary: 'Get current player rank' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns current player rank' })
   @RateLimit({ limit: 20, ttl: 60 })
   @Roles(...AllRoles)
   async getMyRank(
      @Param('type') type: 'score' | 'level' | 'campaign',
      @CurrentAuth() authContext: RequestAuthContext,
   ) {
      return buildSuccessResponse(
         await this.leaderboardApplicationService.getMyRank(type, authContext.playerId),
      );
   }
}

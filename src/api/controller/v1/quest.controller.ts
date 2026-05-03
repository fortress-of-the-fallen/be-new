import { Body, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdempotencyReq } from 'src/api/model/req/common/idempotency-req.model';
import { buildSuccessResponse } from 'src/api/model/res/base/api-envelope.model';
import { AllRoles } from 'src/features/auth/application/role-base.enum';
import { QuestApplicationService } from 'src/features/quest/application';
import { CurrentAuth } from 'src/shared/decorator/current-auth.decorator';
import { Controllers } from 'src/shared/decorator/controller.decorator';
import { RateLimit } from 'src/shared/decorator/rate-limit.decorator';
import { Roles } from 'src/shared/decorator/role.decorator';
import { RequestAuthContext } from 'src/shared/services/auth/auth-context';

@ApiTags('Quest')
@Controllers({ path: 'quests', version: '1' })
export class QuestController {
   constructor(private readonly questApplicationService: QuestApplicationService) {}

   @Get()
   @ApiOperation({ summary: 'Get quest state' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns daily/weekly/achievement quests' })
   @RateLimit({ limit: 20, ttl: 60 })
   @Roles(...AllRoles)
   async getQuests(@CurrentAuth() authContext: RequestAuthContext) {
      return buildSuccessResponse(await this.questApplicationService.getQuests(authContext.playerId));
   }

   @Post(':questId/claim')
   @ApiOperation({ summary: 'Claim quest reward' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Claims a completed quest reward' })
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async claimQuest(
      @CurrentAuth() authContext: RequestAuthContext,
      @Param('questId', ParseIntPipe) questId: number,
      @Body() req: IdempotencyReq,
   ) {
      return buildSuccessResponse(
         await this.questApplicationService.claimQuest(
            authContext.playerId,
            questId,
            req.idempotencyKey,
         ),
      );
   }

   @Post('progress-rewards/:track/:stage/claim')
   @ApiOperation({ summary: 'Claim quest progress reward' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Claims a track milestone reward' })
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async claimProgressReward(
      @CurrentAuth() authContext: RequestAuthContext,
      @Param('track') track: 'daily' | 'weekly',
      @Param('stage', ParseIntPipe) stage: number,
      @Body() req: IdempotencyReq,
   ) {
      return buildSuccessResponse(
         await this.questApplicationService.claimProgressReward(
            authContext.playerId,
            track,
            stage,
            req.idempotencyKey,
         ),
      );
   }
}

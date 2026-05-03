import { Body, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FinishBattleReq } from 'src/api/model/req/battle/finish-battle-req.model';
import { StartBattleReq } from 'src/api/model/req/battle/start-battle-req.model';
import { buildSuccessResponse } from 'src/api/model/res/base/api-envelope.model';
import { AllRoles } from 'src/features/auth/application/role-base.enum';
import { BattleApplicationService } from 'src/features/battle/application';
import { CurrentAuth } from 'src/shared/decorator/current-auth.decorator';
import { Controllers } from 'src/shared/decorator/controller.decorator';
import { RateLimit } from 'src/shared/decorator/rate-limit.decorator';
import { Roles } from 'src/shared/decorator/role.decorator';
import { RequestAuthContext } from 'src/shared/services/auth/auth-context';

@ApiTags('Battle')
@Controllers({ path: 'battles', version: '1' })
export class BattleController {
   constructor(private readonly battleApplicationService: BattleApplicationService) {}

   @Post('start')
   @ApiOperation({ summary: 'Start a battle session' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns battle session seed and opponent snapshot' })
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async startBattle(
      @CurrentAuth() authContext: RequestAuthContext,
      @Body() req: StartBattleReq,
   ) {
      return buildSuccessResponse(
         await this.battleApplicationService.start(
            authContext.playerId,
            req.mode,
            req.formationName,
            req.configVersion,
         ),
      );
   }

   @Post(':battleId/finish')
   @ApiOperation({ summary: 'Finish a battle session and claim rewards' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns battle rewards and player delta' })
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async finishBattle(
      @CurrentAuth() authContext: RequestAuthContext,
      @Param('battleId') battleId: string,
      @Body() req: FinishBattleReq,
   ) {
      return buildSuccessResponse(
         await this.battleApplicationService.finish(authContext.playerId, battleId, req),
      );
   }
}

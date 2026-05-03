import { Body, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigIdempotencyReq } from 'src/api/model/req/common/config-idempotency-req.model';
import { buildSuccessResponse } from 'src/api/model/res/base/api-envelope.model';
import { AllRoles } from 'src/features/auth/application/role-base.enum';
import { InventoryApplicationService } from 'src/features/inventory/application';
import { CurrentAuth } from 'src/shared/decorator/current-auth.decorator';
import { Controllers } from 'src/shared/decorator/controller.decorator';
import { RateLimit } from 'src/shared/decorator/rate-limit.decorator';
import { Roles } from 'src/shared/decorator/role.decorator';
import { RequestAuthContext } from 'src/shared/services/auth/auth-context';

@ApiTags('Inventory')
@Controllers({ path: 'inventory', version: '1' })
export class InventoryController {
   constructor(private readonly inventoryApplicationService: InventoryApplicationService) {}

   @Get()
   @ApiOperation({ summary: 'Get current inventory' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns heroes and skills inventory' })
   @RateLimit({ limit: 20, ttl: 60 })
   @Roles(...AllRoles)
   async getInventory(@CurrentAuth() authContext: RequestAuthContext) {
      return buildSuccessResponse(
         await this.inventoryApplicationService.getInventory(authContext.playerId),
      );
   }

   @Post('heroes/:instanceId/upgrade')
   @ApiOperation({ summary: 'Upgrade hero level' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns upgraded hero and updated currency' })
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async upgradeHero(
      @CurrentAuth() authContext: RequestAuthContext,
      @Param('instanceId') instanceId: string,
      @Body() req: ConfigIdempotencyReq,
   ) {
      return buildSuccessResponse(
         await this.inventoryApplicationService.upgradeHero(
            authContext.playerId,
            instanceId,
            req.configVersion,
            req.idempotencyKey,
         ),
      );
   }

   @Post('heroes/:instanceId/evolve')
   @ApiOperation({ summary: 'Evolve hero using duplicate copies' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns evolved hero and consumed copies' })
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async evolveHero(
      @CurrentAuth() authContext: RequestAuthContext,
      @Param('instanceId') instanceId: string,
      @Body() req: ConfigIdempotencyReq,
   ) {
      return buildSuccessResponse(
         await this.inventoryApplicationService.evolveHero(
            authContext.playerId,
            instanceId,
            req.configVersion,
            req.idempotencyKey,
         ),
      );
   }

   @Post('skills/:itemId/purchase')
   @ApiOperation({ summary: 'Purchase a skill' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns purchased skill and updated currency' })
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async purchaseSkill(
      @CurrentAuth() authContext: RequestAuthContext,
      @Param('itemId') itemId: string,
      @Body() req: ConfigIdempotencyReq,
   ) {
      return buildSuccessResponse(
         await this.inventoryApplicationService.purchaseSkill(
            authContext.playerId,
            itemId,
            req.configVersion,
            req.idempotencyKey,
         ),
      );
   }

   @Post('skills/:instanceId/upgrade')
   @ApiOperation({ summary: 'Upgrade skill level' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns upgraded skill and updated currency' })
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async upgradeSkill(
      @CurrentAuth() authContext: RequestAuthContext,
      @Param('instanceId') instanceId: string,
      @Body() req: ConfigIdempotencyReq,
   ) {
      return buildSuccessResponse(
         await this.inventoryApplicationService.upgradeSkill(
            authContext.playerId,
            instanceId,
            req.configVersion,
            req.idempotencyKey,
         ),
      );
   }
}

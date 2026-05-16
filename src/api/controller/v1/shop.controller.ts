import { Body, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PurchaseShopOfferReq } from 'src/api/model/req/shop/purchase-shop-offer-req.model';
import { buildSuccessResponse } from 'src/api/model/res/base/api-envelope.model';
import { AllRoles } from 'src/features/auth/application/role-base.enum';
import { ShopApplicationService } from 'src/features/shop/application';
import { CurrentAuth } from 'src/shared/decorator/current-auth.decorator';
import { Controllers } from 'src/shared/decorator/controller.decorator';
import { RateLimit } from 'src/shared/decorator/rate-limit.decorator';
import { Roles } from 'src/shared/decorator/role.decorator';
import { RequestAuthContext } from 'src/shared/services/auth/auth-context';

@ApiTags('Shop')
@Controllers({ path: 'shop', version: '1' })
export class ShopController {
   constructor(private readonly shopApplicationService: ShopApplicationService) {}

   @Get('catalog')
   @ApiOperation({ summary: 'Get shop catalog for current player' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns shop offers, currency, and reset window' })
   @RateLimit({ limit: 20, ttl: 60 })
   @Roles(...AllRoles)
   async getCatalog(@CurrentAuth() authContext: RequestAuthContext) {
      return buildSuccessResponse(await this.shopApplicationService.getCatalog(authContext.playerId));
   }

   @Post('offers/:offerId/purchase')
   @ApiOperation({ summary: 'Purchase a shop offer' })
   @ApiBearerAuth('access-token')
   @ApiOkResponse({ description: 'Returns granted rewards and post-purchase state' })
   @RateLimit({ limit: 10, ttl: 60 })
   @Roles(...AllRoles)
   async purchaseOffer(
      @CurrentAuth() authContext: RequestAuthContext,
      @Param('offerId') offerId: string,
      @Body() req: PurchaseShopOfferReq,
   ) {
      return buildSuccessResponse(
         await this.shopApplicationService.purchaseOffer(
            authContext.playerId,
            offerId,
            req.configVersion,
            req.idempotencyKey,
            req.quantity ?? 1,
         ),
      );
   }
}

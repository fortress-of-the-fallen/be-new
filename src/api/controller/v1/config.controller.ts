import { Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { buildSuccessResponse } from 'src/api/model/res/base/api-envelope.model';
import { ConfigApplicationService } from 'src/features/config/application';
import { Controllers } from 'src/shared/decorator/controller.decorator';
import { RateLimit } from 'src/shared/decorator/rate-limit.decorator';

@ApiTags('Config')
@Controllers({ path: 'configs', version: '1' })
export class ConfigController {
   constructor(private readonly configApplicationService: ConfigApplicationService) {}

   @Get('manifest')
   @ApiOperation({ summary: 'Get active config manifest' })
   @ApiOkResponse({ description: 'Returns active config versions' })
   @RateLimit({ limit: 30, ttl: 60 })
   async getManifest() {
      return buildSuccessResponse(await this.configApplicationService.getManifest());
   }

   @Get(':name')
   @ApiOperation({ summary: 'Get config records by name' })
   @ApiOkResponse({ description: 'Returns config data' })
   @RateLimit({ limit: 30, ttl: 60 })
   async getConfig(@Param('name') name: string, @Query('version') version?: string) {
      return buildSuccessResponse(await this.configApplicationService.getConfig(name, version));
   }
}

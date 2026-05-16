import { Injectable } from '@nestjs/common';
import { ConfigCatalogService } from 'src/shared/services/config-catalog.service';

@Injectable()
export class GetConfigApplicationService {
   constructor(private readonly configCatalogService: ConfigCatalogService) {}

   async getConfig(name: string, version?: string) {
      const config = await this.configCatalogService.getConfigDocument(name, version);
      return {
         name: config.name,
         version: config.version,
         records: Array.isArray(config.records) ? config.records : [],
      };
   }
}

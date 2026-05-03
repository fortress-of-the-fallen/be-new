import { Injectable } from '@nestjs/common';
import { ConfigCatalogService } from 'src/shared/services/config-catalog.service';

@Injectable()
export class GetManifestApplicationService {
   constructor(private readonly configCatalogService: ConfigCatalogService) {}

   async getManifest() {
      return this.configCatalogService.getManifest();
   }
}

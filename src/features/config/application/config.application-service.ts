import { Injectable } from '@nestjs/common';
import { GetConfigApplicationService } from './get-config';
import { GetManifestApplicationService } from './get-manifest';

@Injectable()
export class ConfigApplicationService {
   constructor(
      private readonly getConfigApplicationService: GetConfigApplicationService,
      private readonly getManifestApplicationService: GetManifestApplicationService,
   ) {}

   async getManifest() {
      return this.getManifestApplicationService.getManifest();
   }

   async getConfig(name: string, version?: string) {
      return this.getConfigApplicationService.getConfig(name, version);
   }
}

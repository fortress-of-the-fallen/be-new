import { Injectable } from '@nestjs/common';
import { EvolveHeroApplicationService } from './evolve-hero';
import { GetInventoryApplicationService } from './get-inventory';
import { PurchaseSkillApplicationService } from './purchase-skill';
import { UpgradeHeroApplicationService } from './upgrade-hero';
import { UpgradeSkillApplicationService } from './upgrade-skill';

@Injectable()
export class InventoryApplicationService {
   constructor(
      private readonly getInventoryApplicationService: GetInventoryApplicationService,
      private readonly upgradeHeroApplicationService: UpgradeHeroApplicationService,
      private readonly evolveHeroApplicationService: EvolveHeroApplicationService,
      private readonly purchaseSkillApplicationService: PurchaseSkillApplicationService,
      private readonly upgradeSkillApplicationService: UpgradeSkillApplicationService,
   ) {}

   async getInventory(playerId: string) {
      return this.getInventoryApplicationService.getInventory(playerId);
   }

   async upgradeHero(playerId: string, instanceId: string, configVersion: string, idempotencyKey: string) {
      return this.upgradeHeroApplicationService.upgrade(
         playerId,
         instanceId,
         configVersion,
         idempotencyKey,
      );
   }

   async evolveHero(playerId: string, instanceId: string, configVersion: string, idempotencyKey: string) {
      return this.evolveHeroApplicationService.evolve(
         playerId,
         instanceId,
         configVersion,
         idempotencyKey,
      );
   }

   async purchaseSkill(playerId: string, itemId: string, configVersion: string, idempotencyKey: string) {
      return this.purchaseSkillApplicationService.purchase(
         playerId,
         itemId,
         configVersion,
         idempotencyKey,
      );
   }

   async upgradeSkill(playerId: string, instanceId: string, configVersion: string, idempotencyKey: string) {
      return this.upgradeSkillApplicationService.upgrade(
         playerId,
         instanceId,
         configVersion,
         idempotencyKey,
      );
   }
}

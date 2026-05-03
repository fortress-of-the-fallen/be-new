import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import {
   AccountLevelRecord,
   ACTIVE_CONFIG_VERSION,
   DEFAULT_CONFIGS,
   HeroConfigRecord,
   HeroEvolveRuleRecord,
   HeroUpgradeRuleRecord,
   ProfileRenameRuleRecord,
   ProgressRewardDefinitionRecord,
   QuestDefinitionRecord,
   RankRewardRuleRecord,
   SkillPurchaseRuleRecord,
   SkillUpgradeRuleRecord,
   SpriteResourceRecord,
} from './fotf-config.defaults';

@Injectable()
export class ConfigCatalogService {
   constructor(private readonly prisma: PrismaService) {}

   async getManifest(): Promise<{
      activeVersion: string;
      configs: Record<string, string>;
   }> {
      const prismaClient = this.prisma as any;
      const activeConfigs = await prismaClient.config.findMany({
         where: {
            isActive: true,
         },
      });

      if (activeConfigs.length === 0) {
         return {
            activeVersion: ACTIVE_CONFIG_VERSION,
            configs: Object.keys(DEFAULT_CONFIGS).reduce<Record<string, string>>((acc, key) => {
               acc[key] = ACTIVE_CONFIG_VERSION;
               return acc;
            }, {}),
         };
      }

      return {
         activeVersion: activeConfigs[0]?.version ?? ACTIVE_CONFIG_VERSION,
         configs: activeConfigs.reduce((acc: Record<string, string>, item: any) => {
            acc[item.name] = item.version;
            return acc;
         }, {}),
      };
   }

   async getActiveConfigVersion(): Promise<string> {
      return (await this.getManifest()).activeVersion;
   }

   async assertConfigVersion(version: string): Promise<void> {
      const activeVersion = await this.getActiveConfigVersion();
      if (version !== activeVersion) {
         throw new ApiErrorException(
            HttpStatus.CONFLICT,
            ApiErrorCode.ConfigMismatch,
            'Client config version does not match the active server config',
            {
               activeVersion,
               receivedVersion: version,
            },
         );
      }
   }

   async getConfigDocument(name: string, version?: string) {
      const normalizedName = name.trim();
      if (!normalizedName) {
         throw new ApiErrorException(
            HttpStatus.BAD_REQUEST,
            ApiErrorCode.ValidationFailed,
            'Config name is required',
         );
      }

      if (version) {
         const prismaClient = this.prisma as any;
         const config = await prismaClient.config.findUnique({
            where: {
               name_version: {
                  name: normalizedName,
                  version,
               },
            },
         });

         if (!config) {
            throw new ApiErrorException(
               HttpStatus.NOT_FOUND,
               ApiErrorCode.NotFound,
               `Config ${normalizedName} version ${version} was not found`,
            );
         }

         return config;
      }

      const prismaClient = this.prisma as any;
      const activeConfig = await prismaClient.config.findFirst({
         where: {
            name: normalizedName,
            isActive: true,
         },
         orderBy: {
            createdAt: 'desc',
         },
      });

      if (!activeConfig) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Active config ${normalizedName} was not found`,
         );
      }

      return activeConfig;
   }

   async getConfigRecords<T>(name: string, version?: string): Promise<T[]> {
      const config = await this.getConfigDocument(name, version);
      return Array.isArray(config.records) ? (config.records as T[]) : [];
   }

   async getHeroConfig(itemId: string): Promise<HeroConfigRecord> {
      const heroes = await this.getConfigRecords<HeroConfigRecord>('hero');
      const hero = heroes.find(record => record.id === itemId);
      if (!hero) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Hero ${itemId} was not found in active config`,
         );
      }

      return hero;
   }

   async getHeroUpgradeRule(itemId: string, level: number): Promise<HeroUpgradeRuleRecord> {
      const rules = await this.getConfigRecords<HeroUpgradeRuleRecord>('upgrade');
      const rule = rules.find(record => record.kind === 'heroUpgrade' && record.itemId === itemId && record.level === level);
      if (!rule) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Upgrade rule for ${itemId} level ${level} was not found`,
         );
      }

      return rule;
   }

   async getHeroEvolveRule(itemId: string, evolveLevel: number): Promise<HeroEvolveRuleRecord> {
      const rules = await this.getConfigRecords<HeroEvolveRuleRecord>('upgrade');
      const rule = rules.find(
         record => record.kind === 'heroEvolve' && record.itemId === itemId && record.evolveLevel === evolveLevel,
      );
      if (!rule) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Evolve rule for ${itemId} evolve level ${evolveLevel} was not found`,
         );
      }

      return rule;
   }

   async getSkillPurchaseRule(itemId: string): Promise<SkillPurchaseRuleRecord> {
      const rules = await this.getConfigRecords<SkillPurchaseRuleRecord>('upgrade');
      const rule = rules.find(record => record.kind === 'skillPurchase' && record.itemId === itemId);
      if (!rule) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Skill purchase rule for ${itemId} was not found`,
         );
      }

      return rule;
   }

   async getSkillUpgradeRule(itemId: string, level: number): Promise<SkillUpgradeRuleRecord> {
      const rules = await this.getConfigRecords<SkillUpgradeRuleRecord>('upgrade');
      const rule = rules.find(
         record => record.kind === 'skillUpgrade' && record.itemId === itemId && record.level === level,
      );
      if (!rule) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Skill upgrade rule for ${itemId} level ${level} was not found`,
         );
      }

      return rule;
   }

   async getProfileRenameRule(changedNameCount: number): Promise<ProfileRenameRuleRecord> {
      const rules = await this.getConfigRecords<ProfileRenameRuleRecord>('upgrade');
      const sortedRules = rules
         .filter(record => record.kind === 'profileRename')
         .sort((left, right) => right.changedNameCount - left.changedNameCount);
      const rule = sortedRules.find(record => changedNameCount >= record.changedNameCount) ?? sortedRules.at(-1);

      if (!rule) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            'Profile rename rule was not found',
         );
      }

      return rule;
   }

   async getQuestDefinitions(): Promise<{
      quests: QuestDefinitionRecord[];
      progressRewards: ProgressRewardDefinitionRecord[];
   }> {
      const records = await this.getConfigRecords<
         QuestDefinitionRecord | ProgressRewardDefinitionRecord
      >('quest');

      return {
         quests: records.filter(
            (record): record is QuestDefinitionRecord => record.kind !== 'progressReward',
         ),
         progressRewards: records.filter(
            (record): record is ProgressRewardDefinitionRecord => record.kind === 'progressReward',
         ),
      };
   }

   async getRankRewardRule(
      mode: RankRewardRuleRecord['mode'],
      result: RankRewardRuleRecord['result'],
   ): Promise<RankRewardRuleRecord> {
      const rules = await this.getConfigRecords<RankRewardRuleRecord>('rank');
      const rule = rules.find(record => record.mode === mode && record.result === result);
      if (!rule) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Battle reward rule for mode ${mode} result ${result} was not found`,
         );
      }

      return rule;
   }

   async getAccountLevelRules(): Promise<AccountLevelRecord[]> {
      const rules = await this.getConfigRecords<AccountLevelRecord>('accountLevel');
      return rules.sort((left, right) => left.level - right.level);
   }

   async getAvatarIds(): Promise<string[]> {
      const resources = await this.getConfigRecords<SpriteResourceRecord>('spriteResource');
      return resources.filter(record => record.type === 'avatar').map(record => record.id);
   }
}

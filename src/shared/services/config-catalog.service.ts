import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ApiErrorException } from 'src/shared/exception/api-error.exception';
import {
   AccountLevelRecord,
   ACTIVE_CONFIG_VERSION,
   CampaignRewardRecord,
   DEFAULT_CONFIGS,
   HeroConfigRecord,
   HeroEvolveRuleRecord,
   HeroUpgradeRuleRecord,
   LobbyConfigRecord,
   ProfileRenameRuleRecord,
   ProgressRewardDefinitionRecord,
   QuestDefinitionRecord,
   RankRewardBracketRecord,
   RewardItem,
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
            ApiErrorCode.ConfigVersionMismatch,
            'Requested configVersion is not active or not available',
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

   async getCampaignRewardRule(stage: number): Promise<CampaignRewardRecord> {
      const rules = (await this.getConfigRecords<CampaignRewardRecord>('campaign')).sort(
         (left, right) => left.stage - right.stage,
      );
      const rule = [...rules].reverse().find(record => stage >= record.stage) ?? rules[0];
      if (!rule) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Campaign reward rule for stage ${stage} was not found`,
         );
      }

      return rule;
   }

   async getRankRewardRule(score: number): Promise<RankRewardBracketRecord> {
      const rules = (await this.getConfigRecords<RankRewardBracketRecord>('rank')).sort(
         (left, right) => left.MinTrophy - right.MinTrophy,
      );
      const rule =
         rules.find(record => score >= record.MinTrophy && score <= record.MaxTrophy) ??
         [...rules].reverse().find(record => score >= record.MinTrophy) ??
         rules[0];
      if (!rule) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Rank reward rule for score ${score} was not found`,
         );
      }

      return rule;
   }

   async getRankBattleRewards(
      score: number,
      result: 'WIN' | 'LOSE' | 'DRAW',
   ): Promise<RewardItem[]> {
      const rule = await this.getRankRewardRule(score);
      const rewardEntries: Array<[RewardItem['itemId'], number]> =
         result === 'WIN'
            ? [
                 ['GO', rule.WinGolds],
                 ['XP', rule.WinXP],
                 ['Trophy', rule.WinTrophy],
                 ['NormalShard', rule.WinNormalShard],
                 ['EliteShard', rule.WinEliteShard],
                 ['SpecialShard', rule.WinSpecialShard],
              ]
            : [
                 ['GO', rule.LoseGolds],
                 ['XP', rule.LoseXP],
                 ['Trophy', rule.LoseTrophy],
                 ['NormalShard', rule.LoseNormalShard],
                 ['EliteShard', rule.LoseEliteShard],
                 ['SpecialShard', rule.LoseSpecialShard],
              ];

      return rewardEntries
         .filter(([, quantity]) => quantity !== 0)
         .map(([itemId, quantity]) => ({
            itemId,
            quantity,
            customData: null,
         }));
   }

   async getAccountLevelRules(): Promise<AccountLevelRecord[]> {
      const rules = await this.getConfigRecords<AccountLevelRecord>('accountLevel');
      return rules.sort((left, right) => left.level - right.level);
   }

   async getLobbyUpgradeRules(tier: number): Promise<LobbyConfigRecord[]> {
      const rules = (await this.getConfigRecords<LobbyConfigRecord>('lobby'))
         .filter(rule => rule.Tier === tier)
         .sort((left, right) => left.Level - right.Level);

      if (rules.length === 0) {
         throw new ApiErrorException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NotFound,
            `Lobby config for tier ${tier} was not found`,
         );
      }

      return rules;
   }

   async getAvatarIds(): Promise<string[]> {
      const resources = await this.getConfigRecords<SpriteResourceRecord>('spriteResource');
      return resources.filter(record => record.type === 'avatar').map(record => record.id);
   }
}

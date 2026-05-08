export type CurrencyField =
   | 'peasant'
   | 'gold'
   | 'gem'
   | 'normalShard'
   | 'eliteShard'
   | 'specialShard';

export type RewardItem = {
   itemId: string;
   quantity: number;
   customData?: Record<string, string> | null;
};

export type HeroConfigRecord = {
   id: string;
   itemClass: string;
   rarity: 'normal' | 'elite' | 'special';
   shardCurrency: Extract<CurrencyField, 'normalShard' | 'eliteShard' | 'specialShard'>;
};

export type QuestDefinitionRecord = {
   kind?: 'quest';
   id: number;
   typeQuest: 'daily' | 'weekly' | 'achievement';
   questActionId: string;
   desc: string;
   required: number;
   reward: RewardItem[];
   points?: number;
};

export type ProgressRewardDefinitionRecord = {
   kind: 'progressReward';
   track: 'daily' | 'weekly';
   stage: 2 | 4 | 6 | 8;
   reward: RewardItem[];
};

export type HeroUpgradeRuleRecord = {
   kind: 'heroUpgrade';
   itemId: string;
   level: number;
   goldCost: number;
   shardCost: number;
};

export type HeroEvolveRuleRecord = {
   kind: 'heroEvolve';
   itemId: string;
   evolveLevel: number;
   goldCost: number;
   shardCost: number;
   copiesRequired: number;
};

export type SkillPurchaseRuleRecord = {
   kind: 'skillPurchase';
   itemId: string;
   currency: Exclude<CurrencyField, 'peasant'>;
   cost: number;
};

export type SkillUpgradeRuleRecord = {
   kind: 'skillUpgrade';
   itemId: string;
   level: number;
   currency: Exclude<CurrencyField, 'peasant'>;
   cost: number;
};

export type ProfileRenameRuleRecord = {
   kind: 'profileRename';
   changedNameCount: number;
   currency: Exclude<CurrencyField, 'peasant'>;
   cost: number;
};

export type RankRewardRuleRecord = {
   mode: 'PVP' | 'PVE';
   result: 'WIN' | 'LOSE' | 'DRAW';
   rewards: RewardItem[];
};

export type AccountLevelRecord = {
   level: number;
   requiredExp: number;
   rewards?: RewardItem[];
};

export type SpriteResourceRecord = {
   id: string;
   type: 'avatar';
   label: string;
};

export const ACTIVE_CONFIG_VERSION = '2026.05.02.1';

export const DEFAULT_CONFIGS = {
   hero: [
      {
         id: 'Soldier',
         itemClass: 'Unit',
         rarity: 'normal',
         shardCurrency: 'normalShard',
      },
      {
         id: 'Archer',
         itemClass: 'Unit',
         rarity: 'normal',
         shardCurrency: 'normalShard',
      },
      {
         id: 'Prophet',
         itemClass: 'Unit',
         rarity: 'normal',
         shardCurrency: 'normalShard',
      },
   ] satisfies HeroConfigRecord[],
   quest: [
      {
         id: 1,
         typeQuest: 'daily',
         questActionId: 'PLAY_GAME',
         desc: 'Play 3 battles',
         required: 3,
         reward: [{ itemId: 'GE', quantity: 50, customData: null }],
         points: 2,
      },
      {
         id: 2,
         typeQuest: 'daily',
         questActionId: 'WIN_BATTLE',
         desc: 'Win 1 battle',
         required: 1,
         reward: [{ itemId: 'GO', quantity: 100, customData: null }],
         points: 2,
      },
      {
         id: 3,
         typeQuest: 'daily',
         questActionId: 'UPGRADE_UNIT',
         desc: 'Upgrade 1 hero',
         required: 1,
         reward: [{ itemId: 'GE', quantity: 25, customData: null }],
         points: 2,
      },
      {
         id: 101,
         typeQuest: 'weekly',
         questActionId: 'PLAY_GAME',
         desc: 'Play 10 battles',
         required: 10,
         reward: [{ itemId: 'GE', quantity: 100, customData: null }],
         points: 4,
      },
      {
         id: 102,
         typeQuest: 'weekly',
         questActionId: 'UPGRADE_UNIT',
         desc: 'Upgrade 3 heroes',
         required: 3,
         reward: [{ itemId: 'NormalShard', quantity: 5, customData: null }],
         points: 4,
      },
      {
         id: 201,
         typeQuest: 'achievement',
         questActionId: 'WIN_BATTLE',
         desc: 'Win 3 battles',
         required: 3,
         reward: [{ itemId: 'SpecialShard', quantity: 1, customData: null }],
      },
      {
         kind: 'progressReward',
         track: 'daily',
         stage: 2,
         reward: [{ itemId: 'GE', quantity: 50, customData: null }],
      },
      {
         kind: 'progressReward',
         track: 'daily',
         stage: 4,
         reward: [{ itemId: 'GO', quantity: 200, customData: null }],
      },
      {
         kind: 'progressReward',
         track: 'daily',
         stage: 6,
         reward: [{ itemId: 'NormalShard', quantity: 3, customData: null }],
      },
      {
         kind: 'progressReward',
         track: 'daily',
         stage: 8,
         reward: [{ itemId: 'GE', quantity: 100, customData: null }],
      },
      {
         kind: 'progressReward',
         track: 'weekly',
         stage: 2,
         reward: [{ itemId: 'GE', quantity: 75, customData: null }],
      },
      {
         kind: 'progressReward',
         track: 'weekly',
         stage: 4,
         reward: [{ itemId: 'GO', quantity: 500, customData: null }],
      },
      {
         kind: 'progressReward',
         track: 'weekly',
         stage: 6,
         reward: [{ itemId: 'EliteShard', quantity: 2, customData: null }],
      },
      {
         kind: 'progressReward',
         track: 'weekly',
         stage: 8,
         reward: [{ itemId: 'SpecialShard', quantity: 1, customData: null }],
      },
   ] satisfies Array<QuestDefinitionRecord | ProgressRewardDefinitionRecord>,
   rank: [
      {
         mode: 'PVP',
         result: 'WIN',
         rewards: [
            { itemId: 'GO', quantity: 100, customData: null },
            { itemId: 'XP', quantity: 20, customData: null },
            { itemId: 'Trophy', quantity: 3, customData: null },
            { itemId: 'NormalShard', quantity: 1, customData: null },
         ],
      },
      {
         mode: 'PVP',
         result: 'LOSE',
         rewards: [
            { itemId: 'GO', quantity: 40, customData: null },
            { itemId: 'XP', quantity: 10, customData: null },
            { itemId: 'Trophy', quantity: -1, customData: null },
         ],
      },
      {
         mode: 'PVP',
         result: 'DRAW',
         rewards: [
            { itemId: 'GO', quantity: 50, customData: null },
            { itemId: 'XP', quantity: 12, customData: null },
         ],
      },
      {
         mode: 'PVE',
         result: 'WIN',
         rewards: [
            { itemId: 'GO', quantity: 80, customData: null },
            { itemId: 'XP', quantity: 15, customData: null },
            { itemId: 'NormalShard', quantity: 1, customData: null },
         ],
      },
      {
         mode: 'PVE',
         result: 'LOSE',
         rewards: [
            { itemId: 'GO', quantity: 30, customData: null },
            { itemId: 'XP', quantity: 5, customData: null },
         ],
      },
   ] satisfies RankRewardRuleRecord[],
   upgrade: [
      { kind: 'heroUpgrade', itemId: 'Soldier', level: 1, goldCost: 50, shardCost: 2 },
      { kind: 'heroUpgrade', itemId: 'Soldier', level: 2, goldCost: 160, shardCost: 1 },
      { kind: 'heroUpgrade', itemId: 'Soldier', level: 3, goldCost: 240, shardCost: 2 },
      { kind: 'heroUpgrade', itemId: 'Archer', level: 1, goldCost: 50, shardCost: 2 },
      { kind: 'heroUpgrade', itemId: 'Archer', level: 2, goldCost: 160, shardCost: 1 },
      { kind: 'heroUpgrade', itemId: 'Archer', level: 3, goldCost: 240, shardCost: 2 },
      { kind: 'heroUpgrade', itemId: 'Prophet', level: 1, goldCost: 50, shardCost: 2 },
      { kind: 'heroUpgrade', itemId: 'Prophet', level: 2, goldCost: 180, shardCost: 1 },
      { kind: 'heroUpgrade', itemId: 'Prophet', level: 3, goldCost: 260, shardCost: 2 },
      { kind: 'heroEvolve', itemId: 'Soldier', evolveLevel: 1, goldCost: 200, shardCost: 0, copiesRequired: 2 },
      { kind: 'heroEvolve', itemId: 'Archer', evolveLevel: 1, goldCost: 200, shardCost: 0, copiesRequired: 2 },
      { kind: 'heroEvolve', itemId: 'Prophet', evolveLevel: 1, goldCost: 300, shardCost: 1, copiesRequired: 2 },
      { kind: 'skillPurchase', itemId: 'Pray', currency: 'normalShard', cost: 10 },
      { kind: 'skillPurchase', itemId: 'bombardment', currency: 'normalShard', cost: 12 },
      { kind: 'skillUpgrade', itemId: 'Pray', level: 1, currency: 'normalShard', cost: 5 },
      { kind: 'skillUpgrade', itemId: 'Pray', level: 2, currency: 'normalShard', cost: 8 },
      { kind: 'skillUpgrade', itemId: 'bombardment', level: 1, currency: 'normalShard', cost: 6 },
      { kind: 'skillUpgrade', itemId: 'bombardment', level: 2, currency: 'normalShard', cost: 9 },
      { kind: 'profileRename', changedNameCount: 0, currency: 'gold', cost: 0 },
      { kind: 'profileRename', changedNameCount: 1, currency: 'gem', cost: 50 },
   ] satisfies Array<
      | HeroUpgradeRuleRecord
      | HeroEvolveRuleRecord
      | SkillPurchaseRuleRecord
      | SkillUpgradeRuleRecord
      | ProfileRenameRuleRecord
   >,
   accountLevel: [
      { level: 1, requiredExp: 0, rewards: [] },
      { level: 2, requiredExp: 100, rewards: [{ itemId: 'GO', quantity: 100, customData: null }] },
      { level: 3, requiredExp: 250, rewards: [{ itemId: 'GE', quantity: 50, customData: null }] },
      { level: 4, requiredExp: 450, rewards: [{ itemId: 'NormalShard', quantity: 3, customData: null }] },
   ] satisfies AccountLevelRecord[],
   spriteResource: [
      { id: 'normal', type: 'avatar', label: 'Normal' },
      { id: 'avatar_01', type: 'avatar', label: 'Avatar 01' },
      { id: 'avatar_02', type: 'avatar', label: 'Avatar 02' },
   ] satisfies SpriteResourceRecord[],
};

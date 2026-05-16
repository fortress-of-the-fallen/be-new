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

export type CampaignRewardRecord = {
   stage: number;
   goldReward: number;
};

export type RankRewardBracketRecord = {
   name: string;
   MinTrophy: number;
   MaxTrophy: number;
   WinGolds: number;
   WinXP: number;
   WinTrophy: number;
   WinNormalShard: number;
   WinEliteShard: number;
   WinSpecialShard: number;
   LoseGolds: number;
   LoseXP: number;
   LoseTrophy: number;
   LoseNormalShard: number;
   LoseEliteShard: number;
   LoseSpecialShard: number;
};

export type AccountLevelRecord = {
   level: number;
   requiredExp: number;
   rewards?: RewardItem[];
};

export type LobbyConfigRecord = {
   Tier: number;
   Level: number;
   CostTotal: number;
};

export type SpriteResourceRecord = {
   id: string;
   type: 'avatar';
   label: string;
};

export type ShopOfferRewardRecord = {
   itemId: string;
   minQty: number;
   maxQty: number;
   weight: number;
};

export type ShopOfferRecord = {
   offerId: string;
   displayName: string;
   category: 'CHEST';
   itemType: 'CHEST';
   itemId: string;
   iconId: string;
   priceCurrency: 'GO' | 'GE' | 'NormalShard' | 'EliteShard' | 'SpecialShard';
   priceAmount: number;
   maxPurchasePerDay: number;
   isAvailable: boolean;
   rewardSlots?: number;
   rewards: ShopOfferRewardRecord[];
};

export const ACTIVE_CONFIG_VERSION = '2026.05.02.1';

const DEFAULT_CAMPAIGN_REWARDS: CampaignRewardRecord[] = Array.from(
   { length: 100 },
   (_, index) => ({
      stage: index + 1,
      goldReward: 200,
   }),
);

const DEFAULT_LOBBY_RULES: LobbyConfigRecord[] = [
   { Tier: 1, Level: 1, CostTotal: 125 },
   { Tier: 1, Level: 2, CostTotal: 375 },
   { Tier: 1, Level: 3, CostTotal: 750 },
   { Tier: 1, Level: 4, CostTotal: 1250 },
   { Tier: 1, Level: 5, CostTotal: 2000 },
];

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
         reward: [{ itemId: 'GO', quantity: 150, customData: null }],
         points: 2,
      },
      {
         id: 3,
         typeQuest: 'daily',
         questActionId: 'UPGRADE_UNIT',
         desc: 'Upgrade 1 hero',
         required: 1,
         reward: [{ itemId: 'NormalShard', quantity: 5, customData: null }],
         points: 2,
      },
      {
         id: 4,
         typeQuest: 'weekly',
         questActionId: 'PLAY_GAME',
         desc: 'Play 20 battles',
         required: 20,
         reward: [{ itemId: 'GE', quantity: 150, customData: null }],
         points: 4,
      },
      {
         id: 5,
         typeQuest: 'weekly',
         questActionId: 'WIN_BATTLE',
         desc: 'Win 10 battles',
         required: 10,
         reward: [{ itemId: 'GO', quantity: 800, customData: null }],
         points: 4,
      },
      {
         id: 6,
         typeQuest: 'weekly',
         questActionId: 'UPGRADE_UNIT',
         desc: 'Upgrade 5 heroes',
         required: 5,
         reward: [{ itemId: 'EliteShard', quantity: 10, customData: null }],
         points: 4,
      },
      {
         id: 7,
         typeQuest: 'achievement',
         questActionId: 'PLAY_GAME',
         desc: 'Play 50 battles',
         required: 50,
         reward: [{ itemId: 'GE', quantity: 300, customData: null }],
      },
      {
         id: 8,
         typeQuest: 'achievement',
         questActionId: 'WIN_BATTLE',
         desc: 'Win 25 battles',
         required: 25,
         reward: [{ itemId: 'GO', quantity: 1500, customData: null }],
      },
      {
         id: 9,
         typeQuest: 'achievement',
         questActionId: 'UPGRADE_UNIT',
         desc: 'Upgrade 20 heroes',
         required: 20,
         reward: [{ itemId: 'SpecialShard', quantity: 10, customData: null }],
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
   campaign: DEFAULT_CAMPAIGN_REWARDS,
   rank: [
      {
         name: 'Rookie',
         MinTrophy: 0,
         MaxTrophy: 99,
         WinGolds: 30,
         WinXP: 50,
         WinTrophy: 35,
         WinNormalShard: 4,
         WinEliteShard: 1,
         WinSpecialShard: 0,
         LoseGolds: 10,
         LoseXP: 15,
         LoseTrophy: -10,
         LoseNormalShard: 2,
         LoseEliteShard: 0,
         LoseSpecialShard: 0,
      },
      {
         name: 'Fallback',
         MinTrophy: 100,
         MaxTrophy: 999999,
         WinGolds: 30,
         WinXP: 50,
         WinTrophy: 35,
         WinNormalShard: 4,
         WinEliteShard: 1,
         WinSpecialShard: 0,
         LoseGolds: 10,
         LoseXP: 15,
         LoseTrophy: -10,
         LoseNormalShard: 2,
         LoseEliteShard: 0,
         LoseSpecialShard: 0,
      },
   ] satisfies RankRewardBracketRecord[],
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
      { level: 2, requiredExp: 50, rewards: [{ itemId: 'GO', quantity: 100, customData: null }] },
      { level: 3, requiredExp: 150, rewards: [{ itemId: 'GE', quantity: 50, customData: null }] },
      { level: 4, requiredExp: 350, rewards: [{ itemId: 'NormalShard', quantity: 3, customData: null }] },
   ] satisfies AccountLevelRecord[],
   lobby: DEFAULT_LOBBY_RULES satisfies LobbyConfigRecord[],
   shop: [
      {
         offerId: 'chest_wooden',
         displayName: 'Wooden Chest',
         category: 'CHEST',
         itemType: 'CHEST',
         itemId: 'WoodenChest',
         iconId: 'icon_chest_wooden',
         priceCurrency: 'GO',
         priceAmount: 80,
         maxPurchasePerDay: 999,
         isAvailable: true,
         rewardSlots: 2,
         rewards: [
            { itemId: 'GO', minQty: 50, maxQty: 80, weight: 5000 },
            { itemId: 'NormalShard', minQty: 1, maxQty: 2, weight: 3500 },
            { itemId: 'EliteShard', minQty: 1, maxQty: 1, weight: 1300 },
            { itemId: 'SpecialShard', minQty: 1, maxQty: 1, weight: 200 },
         ],
      },
      {
         offerId: 'chest_silver',
         displayName: 'Silver Chest',
         category: 'CHEST',
         itemType: 'CHEST',
         itemId: 'SilverChest',
         iconId: 'icon_chest_silver',
         priceCurrency: 'GE',
         priceAmount: 120,
         maxPurchasePerDay: 20,
         isAvailable: true,
         rewardSlots: 2,
         rewards: [
            { itemId: 'GO', minQty: 100, maxQty: 160, weight: 4000 },
            { itemId: 'NormalShard', minQty: 2, maxQty: 4, weight: 3400 },
            { itemId: 'EliteShard', minQty: 1, maxQty: 2, weight: 2000 },
            { itemId: 'SpecialShard', minQty: 1, maxQty: 1, weight: 600 },
         ],
      },
      {
         offerId: 'chest_gold',
         displayName: 'Gold Chest',
         category: 'CHEST',
         itemType: 'CHEST',
         itemId: 'GoldChest',
         iconId: 'icon_chest_gold',
         priceCurrency: 'GE',
         priceAmount: 240,
         maxPurchasePerDay: 10,
         isAvailable: true,
         rewardSlots: 3,
         rewards: [
            { itemId: 'GO', minQty: 180, maxQty: 260, weight: 3200 },
            { itemId: 'NormalShard', minQty: 3, maxQty: 5, weight: 3300 },
            { itemId: 'EliteShard', minQty: 2, maxQty: 3, weight: 2500 },
            { itemId: 'SpecialShard', minQty: 1, maxQty: 2, weight: 1000 },
         ],
      },
   ] satisfies ShopOfferRecord[],
   spriteResource: [
      { id: 'normal', type: 'avatar', label: 'Normal' },
      { id: 'avatar_01', type: 'avatar', label: 'Avatar 01' },
      { id: 'avatar_02', type: 'avatar', label: 'Avatar 02' },
   ] satisfies SpriteResourceRecord[],
};

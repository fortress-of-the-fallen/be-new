import { ApiProperty } from '@nestjs/swagger';

class PlayerProfileRes {
   @ApiProperty({ example: 'player01' })
   username: string;

   @ApiProperty({ example: 'Player01' })
   displayName: string;

   @ApiProperty({ example: 'normal' })
   avatar: string;

   @ApiProperty({ example: 'VN' })
   country: string;
}

class PlayerCoreStatsRes {
   @ApiProperty({ example: 0 })
   strength: number;

   @ApiProperty({ example: 0 })
   dexterity: number;

   @ApiProperty({ example: 0 })
   constitution: number;

   @ApiProperty({ example: 0 })
   intelligence: number;

   @ApiProperty({ example: 0 })
   wisdom: number;

   @ApiProperty({ example: 0 })
   charisma: number;
}

class PlayerStatisticsRes {
   @ApiProperty({ example: 1 })
   levelMap: number;

   @ApiProperty({ example: 1 })
   wave: number;

   @ApiProperty({ example: 0 })
   gameCoin: number;

   @ApiProperty({ example: 0 })
   expBattle: number;

   @ApiProperty({ example: 0 })
   levelBattle: number;

   @ApiProperty({ example: 1 })
   level: number;

   @ApiProperty({ example: 0 })
   exp: number;

   @ApiProperty({ example: 0 })
   statPointsAvailable: number;

   @ApiProperty({ example: 0 })
   statPointsSpent: number;

   @ApiProperty({ type: PlayerCoreStatsRes })
   coreStats: PlayerCoreStatsRes;

   @ApiProperty({ example: 0 })
   karma: number;

   @ApiProperty({ example: 0 })
   affinity: number;

   @ApiProperty({ example: 0 })
   luck: number;

   @ApiProperty({ example: 0 })
   resistance: number;

   @ApiProperty({ example: 0 })
   changedName: number;

   @ApiProperty({ example: 0 })
   score: number;

   @ApiProperty({ example: 0 })
   trophy: number;

   @ApiProperty({ example: 0 })
   levelCastle: number;

   @ApiProperty({ example: 1 })
   stageCampaign: number;

   @ApiProperty({ example: 0 })
   battlesPlayed: number;

   @ApiProperty({ example: 0 })
   battlesWon: number;

   @ApiProperty({ example: 0 })
   lobbyUpgradeSpent: number;
}

class PlayerTutorialProgressRes {
   @ApiProperty({ example: false })
   finishOnboarding: boolean;

   @ApiProperty({ example: true })
   finishIntro: boolean;

   @ApiProperty({ example: false })
   finishFirstDeploy: boolean;

   @ApiProperty({ example: true })
   finishFirstBattle: boolean;

   @ApiProperty({ example: true })
   finishFirstDragUnit: boolean;

   @ApiProperty({ example: true })
   finishFirstDeployArcher: boolean;

   @ApiProperty({ example: true })
   finishFirstDeployBarricade: boolean;

   @ApiProperty({ example: true })
   finishFirstDeployCavalry: boolean;

   @ApiProperty({ example: true })
   finishUpgradeArcher: boolean;

   @ApiProperty({ example: true })
   finishUpgradeBase: boolean;

   @ApiProperty({ example: true })
   finishUpgradeUnitStat: boolean;

   @ApiProperty({ example: true })
   finishPurchaseSkill: boolean;

   @ApiProperty({ example: true })
   finishPvP: boolean;

   @ApiProperty({ example: false })
   isDoneUpgradeUnitTutorial: boolean;

   @ApiProperty({ example: '2026-05-05T10:00:00.000Z' })
   updatedAt: string;
}

class PlayerCurrencyRes {
   @ApiProperty({ example: 0 })
   peasant: number;

   @ApiProperty({ example: 500 })
   gold: number;

   @ApiProperty({ example: 0 })
   gem: number;

   @ApiProperty({ example: 0 })
   normalShard: number;

   @ApiProperty({ example: 0 })
   eliteShard: number;

   @ApiProperty({ example: 0 })
   specialShard: number;
}

class PlayerInventoryItemRes {
   @ApiProperty({ example: 'p_abc123_hi_soldier' })
   instanceId: string;

   @ApiProperty({ example: 'Soldier' })
   itemId: string;

   @ApiProperty({ example: 'hero' })
   itemType: string;

   @ApiProperty({ example: 'Unit', nullable: true })
   itemClass?: string | null;

   @ApiProperty({ example: 0 })
   remainingUses: number;

   @ApiProperty({
      example: {
         lv: '1',
         evlove_lv: '1',
         evlove_value: '1',
      },
   })
   customData: Record<string, string>;
}

class PlayerInventoryRes {
   @ApiProperty({ type: [PlayerInventoryItemRes] })
   heroes: PlayerInventoryItemRes[];

   @ApiProperty({ type: [PlayerInventoryItemRes] })
   skills: PlayerInventoryItemRes[];
}

class PlayerFormationPositionRes {
   @ApiProperty({ example: 0 })
   x: number;

   @ApiProperty({ example: 0 })
   y: number;

   @ApiProperty({ example: 0 })
   z: number;
}

class PlayerFormationSlotRes {
   @ApiProperty({ example: 0 })
   slot: number;

   @ApiProperty({ example: 'Soldier' })
   unitName: string;

   @ApiProperty({ type: PlayerFormationPositionRes })
   position: PlayerFormationPositionRes;
}

class PlayerFormationRes {
   @ApiProperty({ example: 'active' })
   name: string;

   @ApiProperty({ type: [PlayerFormationSlotRes] })
   slots: PlayerFormationSlotRes[];
}

class PlayerQuestRewardPayloadRes {
   @ApiProperty({ example: 'GE' })
   itemId: string;

   @ApiProperty({ example: 50 })
   quantity: number;

   @ApiProperty({ example: null, nullable: true, required: false })
   customData?: Record<string, string> | null;
}

class PlayerQuestRes {
   @ApiProperty({ example: 1 })
   questId: number;

   @ApiProperty({ example: 'daily' })
   type: string;

   @ApiProperty({ example: 'PLAY_GAME' })
   actionId: string;

   @ApiProperty({ example: 'Play 3 battles' })
   description: string;

   @ApiProperty({ example: 1 })
   progress: number;

   @ApiProperty({ example: 3 })
   required: number;

   @ApiProperty({ example: false })
   isCompleted: boolean;

   @ApiProperty({ example: false })
   rewardClaimed: boolean;

   @ApiProperty({ type: [PlayerQuestRewardPayloadRes] })
   rewards: PlayerQuestRewardPayloadRes[];
}

class PlayerQuestProgressRewardRes {
   @ApiProperty({ example: 2 })
   stage: number;

   @ApiProperty({ example: false })
   claimed: boolean;

   @ApiProperty({ example: true })
   isUnlocked: boolean;

   @ApiProperty({ type: PlayerQuestRewardPayloadRes })
   reward: PlayerQuestRewardPayloadRes;
}

class PlayerQuestTrackRes {
   @ApiProperty({ example: '2026-05-03T00:00:00Z' })
   resetAt: string;

   @ApiProperty({ example: 0 })
   points: number;

   @ApiProperty({ type: [PlayerQuestRes] })
   quests: PlayerQuestRes[];

   @ApiProperty({ type: [PlayerQuestProgressRewardRes] })
   progressRewards: PlayerQuestProgressRewardRes[];
}

class PlayerAchievementTrackRes {
   @ApiProperty({ type: [PlayerQuestRes] })
   quests: PlayerQuestRes[];
}

class PlayerQuestStateRes {
   @ApiProperty({ type: PlayerQuestTrackRes })
   daily: PlayerQuestTrackRes;

   @ApiProperty({ type: PlayerQuestTrackRes })
   weekly: PlayerQuestTrackRes;

   @ApiProperty({ type: PlayerAchievementTrackRes })
   achievement: PlayerAchievementTrackRes;
}

export class CurrentPlayerRes {
   @ApiProperty({ example: 'p_abc123' })
   playerId: string;

   @ApiProperty({ example: 'player01' })
   username: string;

   @ApiProperty({ type: PlayerProfileRes })
   profile: PlayerProfileRes;

   @ApiProperty({ type: PlayerStatisticsRes })
   statistics: PlayerStatisticsRes;

   @ApiProperty({ type: PlayerTutorialProgressRes })
   tutorialProgress: PlayerTutorialProgressRes;

   @ApiProperty({ type: PlayerCurrencyRes })
   currency: PlayerCurrencyRes;

   @ApiProperty({ type: PlayerInventoryRes })
   inventory: PlayerInventoryRes;

   @ApiProperty({ type: PlayerFormationRes, nullable: true })
   formation: PlayerFormationRes | null;

   @ApiProperty({ type: PlayerQuestStateRes })
   quests: PlayerQuestStateRes;

   @ApiProperty({ example: '2026.05.02.1' })
   configVersion: string;
}

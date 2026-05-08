export type CurrentPlayerInventoryItem = {
   instanceId: string;
   itemId: string;
   itemType: string;
   itemClass?: string | null;
   remainingUses: number;
   customData: Record<string, string>;
};

export type CurrentPlayerFormationSlot = {
   slot: number;
   unitName: string;
   position: {
      x: number;
      y: number;
      z: number;
   };
};

export type CurrentPlayerQuest = {
   questId: number;
   type: string;
   actionId: string;
   description: string;
   progress: number;
   required: number;
   isCompleted: boolean;
   rewardClaimed: boolean;
   rewards: Array<{
      itemId: string;
      quantity: number;
      customData?: Record<string, string> | null;
   }>;
};

export type CurrentPlayerQuestProgressReward = {
   stage: number;
   claimed: boolean;
   isUnlocked: boolean;
   reward: {
      itemId: string;
      quantity: number;
      customData?: Record<string, string> | null;
   };
};

export type CurrentPlayerTutorialProgress = {
   finishOnboarding: boolean;
   finishIntro: boolean;
   finishFirstDeploy: boolean;
   finishFirstBattle: boolean;
   finishFirstDragUnit: boolean;
   finishFirstDeployArcher: boolean;
   finishFirstDeployBarricade: boolean;
   finishFirstDeployCavalry: boolean;
   finishUpgradeArcher: boolean;
   finishUpgradeBase: boolean;
   finishUpgradeUnitStat: boolean;
   finishPurchaseSkill: boolean;
   finishPvP: boolean;
   isDoneUpgradeUnitTutorial: boolean;
   updatedAt: string;
};

export type CurrentPlayerState = {
   playerId: string;
   username: string;
   profile: Record<string, any>;
   statistics: Record<string, any>;
   tutorialProgress: CurrentPlayerTutorialProgress;
   currency: Record<string, any>;
   inventory: {
      heroes: CurrentPlayerInventoryItem[];
      skills: CurrentPlayerInventoryItem[];
   };
   formation: {
      name: string;
      slots: CurrentPlayerFormationSlot[];
   } | null;
   quests: {
      daily: {
         resetAt: string;
         points: number;
         quests: CurrentPlayerQuest[];
         progressRewards: CurrentPlayerQuestProgressReward[];
      };
      weekly: {
         resetAt: string;
         points: number;
         quests: CurrentPlayerQuest[];
         progressRewards: CurrentPlayerQuestProgressReward[];
      };
      achievement: {
         quests: CurrentPlayerQuest[];
      };
   };
   configVersion: string;
};

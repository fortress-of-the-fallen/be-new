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
   progress: number;
   required: number;
   claimed: boolean;
   periodKey: string;
};

export type CurrentPlayerQuestProgressReward = {
   track: string;
   stage: number;
   points: number;
   periodKey: string;
   reward: {
      itemId: string;
      quantity: number;
      customData?: Record<string, string> | null;
   };
   claimed: boolean;
};

export type CurrentPlayerState = {
   playerId: string;
   username: string;
   profile: Record<string, any>;
   statistics: Record<string, any>;
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

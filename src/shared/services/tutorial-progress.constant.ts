export const TUTORIAL_PROGRESS_FIELDS = [
   'finishOnboarding',
   'finishIntro',
   'finishFirstDeploy',
   'finishFirstBattle',
   'finishFirstDragUnit',
   'finishFirstDeployArcher',
   'finishFirstDeployBarricade',
   'finishFirstDeployCavalry',
   'finishUpgradeArcher',
   'finishUpgradeBase',
   'finishUpgradeUnitStat',
   'finishPurchaseSkill',
   'finishPvP',
   'isDoneUpgradeUnitTutorial',
] as const;

export type TutorialProgressField = (typeof TUTORIAL_PROGRESS_FIELDS)[number];

export const ACTIVE_TUTORIAL_PROGRESS_FIELDS = [
   'finishOnboarding',
   'finishFirstDeploy',
   'isDoneUpgradeUnitTutorial',
] as const;

export type ActiveTutorialProgressField = (typeof ACTIVE_TUTORIAL_PROGRESS_FIELDS)[number];

export type TutorialProgressFlags = Record<TutorialProgressField, boolean>;

export type TutorialProgressState = TutorialProgressFlags & {
   updatedAt: string;
};

export const ACTIVE_TUTORIAL_PROGRESS_META_KEY = '_verifiedActiveFlags';

export const DEFAULT_TUTORIAL_PROGRESS_FLAGS: TutorialProgressFlags = {
   finishOnboarding: false,
   finishIntro: true,
   finishFirstDeploy: false,
   finishFirstBattle: true,
   finishFirstDragUnit: true,
   finishFirstDeployArcher: true,
   finishFirstDeployBarricade: true,
   finishFirstDeployCavalry: true,
   finishUpgradeArcher: true,
   finishUpgradeBase: true,
   finishUpgradeUnitStat: true,
   finishPurchaseSkill: true,
   finishPvP: true,
   isDoneUpgradeUnitTutorial: false,
};

export function buildDefaultTutorialProgress(now: Date = new Date()): TutorialProgressState {
   return {
      ...DEFAULT_TUTORIAL_PROGRESS_FLAGS,
      updatedAt: now.toISOString(),
   };
}

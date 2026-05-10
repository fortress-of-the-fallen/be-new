# Backend Spec: Level-Up and EXP Sync

## Problem

Unity client uses `statistics.level` and `statistics.exp` from backend as the authoritative player progression state.

Current backend behavior can return a battle finish response like:

```json
{
  "playerDelta": {
    "levelBefore": 1,
    "levelAfter": 1,
    "expBefore": 0,
    "expAfter": 50
  },
  "statistics": {
    "level": 1,
    "exp": 50
  }
}
```

This is invalid when the active account-level config says level 1 requires `50 XP`.

The client then sees `level=1, exp=50/50`: the EXP bar is full, but the player is still level 1. Upgrade tutorial also does not start because the tutorial gate requires `level >= 2`.

## Source of Truth

Backend is the source of truth for:

- account level
- account EXP
- battle rewards
- level-up result
- tutorial progression persisted after battle

Unity must not infer a level-up if backend returns `statistics.level=1`.

## EXP Contract

`statistics.exp` must represent the player's EXP inside the current level, not lifetime cumulative EXP.

Example:

- Level 1 requires 50 XP.
- Player starts at `level=1, exp=0`.
- Battle grants `XP +50`.
- Backend must consume 50 XP to advance the player to level 2.
- Final state must be `level=2, exp=0`.

If a battle grants more EXP than one level requires, backend must loop until remaining EXP is below the next level requirement.

## Level-Up Algorithm

Pseudo-code:

```ts
let level = player.statistics.level;
let exp = player.statistics.exp + grantedXp;

while (true) {
  const requiredXp = getAccountLevelConfig(level).XP;

  if (!requiredXp || requiredXp <= 0) {
    break;
  }

  if (exp < requiredXp) {
    break;
  }

  exp -= requiredXp;
  level += 1;
}

player.statistics.level = level;
player.statistics.exp = exp;
```

Important condition:

```ts
exp >= requiredXp
```

Do not use:

```ts
exp > requiredXp
```

The exact-threshold case must level up.

## Battle Finish Response Contract

Endpoint:

```http
POST /api/v1/battles/{battleId}/finish
```

When battle rewards cause a level-up, response must include the updated progression in both `playerDelta` and `statistics`.

Expected example for level 1 with `XP +50`:

```json
{
  "success": true,
  "data": {
    "battleId": "b_example",
    "result": "WIN",
    "grantedRewards": [
      { "itemId": "GO", "quantity": 30, "customData": null },
      { "itemId": "XP", "quantity": 50, "customData": null }
    ],
    "rewards": [
      { "itemId": "GO", "quantity": 30, "customData": null },
      { "itemId": "XP", "quantity": 50, "customData": null }
    ],
    "playerDelta": {
      "levelBefore": 1,
      "levelAfter": 2,
      "scoreBefore": 0,
      "scoreAfter": 35,
      "expBefore": 0,
      "expAfter": 0
    },
    "statistics": {
      "level": 2,
      "exp": 0,
      "score": 35,
      "trophy": 35,
      "stageCampaign": 2,
      "battlesPlayed": 1,
      "battlesWon": 1
    },
    "tutorialProgress": {
      "finishOnboarding": true,
      "finishFirstDeploy": true,
      "isDoneUpgradeUnitTutorial": false
    }
  }
}
```

## GET /me Contract

After a successful battle finish, `GET /api/v1/me` must return the same persisted state.

Expected:

```json
{
  "statistics": {
    "level": 2,
    "exp": 0,
    "stageCampaign": 2,
    "score": 35,
    "trophy": 35
  },
  "tutorialProgress": {
    "finishOnboarding": true,
    "finishFirstDeploy": true,
    "isDoneUpgradeUnitTutorial": false
  }
}
```

Invalid:

```json
{
  "statistics": {
    "level": 1,
    "exp": 50
  }
}
```

This is invalid if level 1 requires 50 XP.

## Tutorial Dependency

Unity starts the upgrade tutorial only when all conditions are true:

```csharp
finishOnboarding == true
finishFirstDeploy == true
level >= 2
isDoneUpgradeUnitTutorial == false
HasAnyUpgradedUnit() == false
```

Therefore, after the post-onboarding battle that grants enough XP, backend must persist and return:

```json
{
  "statistics": {
    "level": 2
  },
  "tutorialProgress": {
    "finishFirstDeploy": true,
    "isDoneUpgradeUnitTutorial": false
  }
}
```

## Acceptance Tests

### Case 1: Exact XP threshold

Initial player:

```json
{
  "statistics": {
    "level": 1,
    "exp": 0
  }
}
```

Battle reward:

```json
[
  { "itemId": "XP", "quantity": 50 }
]
```

Expected final state:

```json
{
  "statistics": {
    "level": 2,
    "exp": 0
  },
  "playerDelta": {
    "levelBefore": 1,
    "levelAfter": 2,
    "expBefore": 0,
    "expAfter": 0
  }
}
```

### Case 2: Partial XP below threshold

Initial player:

```json
{
  "statistics": {
    "level": 1,
    "exp": 10
  }
}
```

Battle reward:

```json
[
  { "itemId": "XP", "quantity": 20 }
]
```

Expected final state:

```json
{
  "statistics": {
    "level": 1,
    "exp": 30
  },
  "playerDelta": {
    "levelBefore": 1,
    "levelAfter": 1,
    "expBefore": 10,
    "expAfter": 30
  }
}
```

### Case 3: Overflow XP

If level 1 requires 50 XP and level 2 requires 100 XP:

Initial player:

```json
{
  "statistics": {
    "level": 1,
    "exp": 40
  }
}
```

Battle reward:

```json
[
  { "itemId": "XP", "quantity": 80 }
]
```

Expected final state:

```json
{
  "statistics": {
    "level": 2,
    "exp": 70
  },
  "playerDelta": {
    "levelBefore": 1,
    "levelAfter": 2,
    "expBefore": 40,
    "expAfter": 70
  }
}
```

## Unity Validation Flow

1. Register a fresh account.
2. Confirm `GET /me` returns `level=1`, `exp=0`.
3. Complete onboarding battle.
4. Complete post-onboarding battle that grants `XP +50`.
5. Confirm `POST /battles/{battleId}/finish` returns `levelAfter=2`, `expAfter=0`.
6. Confirm `GET /me` returns `statistics.level=2`, `statistics.exp=0`.
7. In Unity, close reward popup.
8. Lobby must show level 2, EXP not stuck at full level 1 bar.
9. Upgrade tutorial must start if the player has not upgraded any unit.

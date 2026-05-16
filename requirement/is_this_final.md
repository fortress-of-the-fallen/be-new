# Backend Config Sync and Reward Source of Truth Spec

This document consolidates the backend fixes needed by the Unity client after the latest reward, quest, and fake PvP integration tests.

## Goal

Backend must use the same active config version that it exposes through:

```http
GET /api/v1/configs/manifest
```

All reward, quest, battle, upgrade, and level calculations must come from that config version. Backend must not mix old hardcoded values with the active config.

For authenticated players, Unity treats backend responses as the runtime source of truth:

- Quest UI uses quest definitions returned by `/me`, `/quests`, or mutation responses when available.
- Reward popup uses `grantedRewards`/`rewards` returned by battle finish.
- Currency UI uses post-mutation `currency` returned by backend.
- Quest claim does not locally add rewards or quest points on top of backend state.
- After login, local CSV is not the reward source of truth. It is only an unauthenticated/offline/dev fallback.

Current tested active config version:

```json
{
  "activeVersion": "2026.05.02.1",
  "configs": {
    "hero": "2026.05.02.1",
    "quest": "2026.05.02.1",
    "rank": "2026.05.02.1",
    "upgrade": "2026.05.02.1",
    "accountLevel": "2026.05.02.1",
    "spriteResource": "2026.05.02.1",
    "campaign": "2026.05.02.1"
  }
}
```

## Required Config Sources

Backend must load and calculate from these config tables:

| Area | Config source | Used by |
| --- | --- | --- |
| Quest definitions and quest rewards | `ConfigQuest` | `/me`, `/quests`, quest claim |
| Rank/PvP battle rewards | `ConfigRank` | `/battles/start`, `/battles/{id}/finish` for `mode=PVP` |
| Campaign/PvE rewards | `ConfigCampaign` | `/battles/{id}/finish` for `mode=PVE` |
| Hero upgrade costs | `ConfigUpgrade` and/or hero upgrade config | `/inventory/heroes/{instanceId}/upgrade` |
| Account XP/level/stat point rewards | `ConfigAccountLevel` | battle finish, `/me` statistics |
| Hero inventory defaults and hero metadata | `ConfigHero` | account bootstrap, `/me`, upgrade/evolve APIs |

If the client sends `configVersion`, backend must either:

- use that exact version, or
- reject the request with an explicit config error.

Backend must not silently fall back to a different config.

Recommended error:

```json
{
  "success": false,
  "error": {
    "code": "CONFIG_VERSION_MISMATCH",
    "message": "Requested configVersion is not active or not available"
  }
}
```

## Quest Config Contract

`GET /api/v1/me` and `GET /api/v1/quests` must return quest definitions from `ConfigQuest`, not from stale hardcoded backend data.

Field mapping:

| Backend response field | ConfigQuest field |
| --- | --- |
| `questId` | `id` |
| `type` | `typeQuest` |
| `actionId` | `questActionId` |
| `description` | `desc` |
| `required` | `required` |
| `rewards` | parsed `reward` JSON |

For the current client config, quest definitions are:

| questId | type | actionId | required | rewards |
| --- | --- | --- | ---: | --- |
| 1 | daily | `PLAY_GAME` | 3 | `GE x50` |
| 2 | daily | `WIN_BATTLE` | 1 | `GO x150` |
| 3 | daily | `UPGRADE_UNIT` | 1 | `NormalShard x5` |
| 4 | weekly | `PLAY_GAME` | 20 | `GE x150` |
| 5 | weekly | `WIN_BATTLE` | 10 | `GO x800` |
| 6 | weekly | `UPGRADE_UNIT` | 5 | `EliteShard x10` |
| 7 | achievement | `PLAY_GAME` | 50 | `GE x300` |
| 8 | achievement | `WIN_BATTLE` | 25 | `GO x1500` |
| 9 | achievement | `UPGRADE_UNIT` | 20 | `SpecialShard x10` |

Important observed bug:

- Client config says quest `3` rewards `NormalShard x5`.
- Backend returned quest `3` as `GE x25`.
- Claiming quest `3` returned `currency.gem +25` and did not increase `currency.normalShard`.

Required fix:

- Backend quest `3` must match active `ConfigQuest`: `NormalShard x5`.
- `POST /api/v1/quests/3/claim` must grant `NormalShard x5`.
- The same claim response must return post-claim `currency.normalShard`.
- The next `GET /api/v1/me` and `GET /api/v1/quests` must show the same persisted result.

Valid claim response example:

```json
{
  "success": true,
  "data": {
    "quest": {
      "questId": 3,
      "type": "daily",
      "actionId": "UPGRADE_UNIT",
      "progress": 1,
      "required": 1,
      "isCompleted": true,
      "rewardClaimed": true
    },
    "grantedRewards": [
      {
        "itemId": "NormalShard",
        "quantity": 5,
        "customData": null
      }
    ],
    "currency": {
      "peasant": 0,
      "gold": 1171,
      "gem": 25,
      "normalShard": 7,
      "eliteShard": 1,
      "specialShard": 0
    },
    "dailyPoints": 2
  }
}
```

If response includes `currency`, every returned currency field must already include the granted reward. Unity treats `currency` as source of truth and does not add `grantedRewards` on top.

## Quest Progress Reward Contract

Daily and weekly tracks must include progress rewards in `/me` and `/quests`.

Unity accepts either singular `reward` or array `rewards`, but backend should prefer `reward` if each stage has exactly one reward:

```json
{
  "stage": 2,
  "claimed": false,
  "isUnlocked": true,
  "reward": {
    "itemId": "GE",
    "quantity": 50,
    "customData": null
  }
}
```

If backend uses array form, the equivalent shape is:

```json
{
  "stage": 2,
  "claimed": false,
  "isUnlocked": true,
  "rewards": [
    {
      "itemId": "GE",
      "quantity": 50,
      "customData": null
    }
  ]
}
```

Required rules:

- `daily.progressRewards` and `weekly.progressRewards` must include all visible stage rewards.
- `claimed` must be persisted server state.
- Claiming a progress reward must return post-claim `currency`.
- Next `/quests` must return that stage with `claimed=true`.

## Battle Reward Contract

### PvE / Campaign

For `mode=PVE`, backend must calculate rewards from `ConfigCampaign`.

Required behavior:

- Determine the campaign stage used for reward.
- Grant `GO` from `ConfigCampaign.goldReward`.
- Return post-mutation `currency`.
- Return post-mutation `statistics`.
- Return `questUpdates` for affected daily, weekly, and achievement quests.

### PvP / Fake PvP

The current Unity fake PvP flow starts backend battle sessions with:

```json
{
  "mode": "PVP",
  "formationName": "active",
  "configVersion": "2026.05.02.1"
}
```

Backend must treat this as the rank/PvP reward flow and calculate rewards from `ConfigRank`.

Rank selection:

```text
rank row where MinTrophy <= player.scoreBeforeFinish <= MaxTrophy
```

For result `WIN`, use:

- `WinGolds` -> `GO`
- `WinXP` -> `XP`
- `WinTrophy` -> `Trophy`
- `WinNormalShard` -> `NormalShard`
- `WinEliteShard` -> `EliteShard`
- `WinSpecialShard` -> `SpecialShard`

For result `LOSE`, use the corresponding `Lose*` columns.

Current `Rookie` win expected reward:

```json
[
  { "itemId": "GO", "quantity": 30, "customData": null },
  { "itemId": "XP", "quantity": 50, "customData": null },
  { "itemId": "Trophy", "quantity": 35, "customData": null },
  { "itemId": "NormalShard", "quantity": 4, "customData": null },
  { "itemId": "EliteShard", "quantity": 1, "customData": null }
]
```

Required finish response shape:

```json
{
  "success": true,
  "data": {
    "battleId": "b_123",
    "result": "WIN",
    "grantedRewards": [],
    "rewards": [],
    "playerDelta": {
      "levelBefore": 1,
      "levelAfter": 1,
      "scoreBefore": 0,
      "scoreAfter": 35,
      "expBefore": 0,
      "expAfter": 50
    },
    "statistics": {},
    "currency": {},
    "questUpdates": []
  }
}
```

`grantedRewards` and `rewards` should contain the same reward list for client compatibility.

## Hero Upgrade Contract

`POST /api/v1/inventory/heroes/{instanceId}/upgrade` must calculate cost from active upgrade config.

Required response:

```json
{
  "success": true,
  "data": {
    "updatedHero": {},
    "hero": {},
    "consumed": [
      { "itemId": "GO", "quantity": 50 },
      { "itemId": "NormalShard", "quantity": 2 }
    ],
    "currency": {},
    "tutorialProgress": {},
    "questUpdates": []
  }
}
```

Rules:

- `consumed` must match active config cost.
- `currency` must be the post-upgrade persisted currency.
- `updatedHero.customData.lv` must be the post-upgrade level.
- `questUpdates` must include affected `UPGRADE_UNIT` quests.
- `GET /me` immediately after upgrade must return the same hero level and currency.

## Mutation Consistency Rules

These endpoints mutate player state and must be atomic and idempotent:

- `POST /api/v1/battles/{battleId}/finish`
- `POST /api/v1/quests/{questId}/claim`
- `POST /api/v1/quests/progress-rewards/{track}/{stage}/claim`
- `POST /api/v1/inventory/heroes/{instanceId}/upgrade`

Required rules:

- Same `idempotencyKey` must not double grant rewards.
- Response must represent persisted post-mutation state.
- Next `GET /api/v1/me` must match the mutation response.
- Next `GET /api/v1/quests` must match quest progress and claimed state from the mutation.
- Retryable write conflicts/deadlocks should be retried server-side, or returned with a retryable error code.

## Acceptance Checklist

Backend is considered fixed when all checks pass:

- `/configs/manifest` includes `campaign` and all active config versions.
- `/quests` quest definitions match active `ConfigQuest`.
- Quest `3` returns `NormalShard x5`, not `GE x25`, for current config.
- Claiming quest `3` increases `currency.normalShard` by `5`.
- Next `/me` after claiming quest `3` shows the increased `normalShard` and `rewardClaimed=true`.
- `/quests` returns visible daily/weekly `progressRewards` with either `reward` or `rewards`.
- Claiming a progress reward persists `claimed=true` and returns post-claim `currency`.
- Starting fake PvP with `mode=PVP` succeeds.
- Finishing fake PvP uses `ConfigRank` rewards.
- Rookie PvP win returns `GO 30`, `XP 50`, `Trophy 35`, `NormalShard 4`, `EliteShard 1`.
- PvE finish uses `ConfigCampaign.goldReward`.
- Hero upgrade consumes costs from active upgrade config and returns post-upgrade `currency`.
- All mutation responses and subsequent `/me` responses are consistent.


# Backend Required Fixes for Unity Client Sync

This document is the consolidated backend contract required for the current Unity client tutorial, reward, upgrade, quest, and fake PvP flow to work correctly.

Related detailed specs:

- `TUTORIAL_PROGRESS_FLAGS_SPEC.md`
- `BATTLE_FINISH_REWARDS_API_SPEC.md`
- `HERO_UPGRADE_API_SPEC.md`
- `QUEST_PROGRESS_API_SPEC.md`

## Current Problem Summary

The Unity client can authenticate, start battles, finish battles, show reward UI, upgrade heroes, and show quest UI. However, the backend state currently regresses after app restart in several cases:

- Battle rewards shown in `UIReward` are not consistently persisted to backend.
- `/me` after restart may return old `statistics`, `currency`, `inventory`, or `quests`.
- Tutorial flags may say a tutorial is complete even though the required backend state is not complete.
- Upgrade UI may show enough resources locally, but backend rejects upgrade with `INSUFFICIENT_RESOURCES`.
- Quest progress may reset to `0` before server-side reset time.
- Fake PvP is client-side AI/local gameplay, but it still needs backend reward persistence.

The API surface is mostly sufficient. The required work is mainly persistence and response consistency.

## Required Endpoints

Backend must support these endpoints:

```http
GET   /api/v1/me
GET   /api/v1/quests
GET   /api/v1/inventory
PATCH /api/v1/me/tutorial-progress
POST  /api/v1/battles/start
POST  /api/v1/battles/{battleId}/finish
POST  /api/v1/inventory/heroes/{instanceId}/upgrade
POST  /api/v1/inventory/heroes/{instanceId}/evolve
POST  /api/v1/quests/{questId}/claim
POST  /api/v1/quests/progress-rewards/{track}/{stage}/claim
```

Required for the current fake PvP flow:

```http
POST /api/v1/battles/start
```

must accept `mode: "PVP"` for the current fake PvP client flow.

If backend treats fake PvP as PVE, Unity will show campaign rewards instead of rank/PvP rewards.

## Global Consistency Rules

For authenticated accounts, backend is the source of truth for:

- player statistics
- campaign stage
- currency
- inventory hero levels and instance IDs
- tutorial flags
- quest progress and claim state
- battle reward grant history

Every mutation endpoint must satisfy:

1. Persist the mutation before returning success.
2. Return the full post-mutation state for affected domains.
3. `GET /me` immediately after the mutation must return the same persisted state.
4. `GET /quests` immediately after quest-affecting mutations must return the same quest state.
5. Retrying a mutation with the same `idempotencyKey` must not grant rewards or consume resources twice.

## Battle Start Contract

Endpoint:

```http
POST /api/v1/battles/start
```

PVE request currently sent by Unity:

```json
{
  "mode": "PVE",
  "formationName": "active",
  "configVersion": "2026.05.02.1"
}
```

Fake PvP request currently sent by Unity:

```json
{
  "mode": "PVP",
  "formationName": "active",
  "configVersion": "2026.05.02.1"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "battleId": "b_abc123",
    "mode": "PVE",
    "seed": 123456,
    "configVersion": "2026.05.02.1",
    "expiresAt": "2026-05-07T09:00:00.000Z"
  },
  "serverTime": "2026-05-07T08:45:00.000Z"
}
```

Required rules:

- `battleId` must be non-empty.
- Backend must persist an active battle session for the authenticated player.
- That active session must be finishable by `POST /battles/{battleId}/finish`.
- The session should expire only after `expiresAt`, not while the match is still running normally.
- If only one active session per player is allowed, starting a new session should either replace the stale previous session or return a clear error.

Invalid behavior:

```text
POST /battles/start succeeds, but /battles/{battleId}/finish returns BATTLE_SESSION_MISSING.
```

## Battle Finish Contract

Endpoint:

```http
POST /api/v1/battles/{battleId}/finish
```

Request:

```json
{
  "idempotencyKey": "78f8b7a4-8e9e-4c24-91fd-f8f7560c31af",
  "result": "WIN",
  "durationSec": 42,
  "winCondition": "ReachCastle",
  "playerPercent": 0.93
}
```

Success response must include:

```json
{
  "success": true,
  "data": {
    "battleId": "b_abc123",
    "result": "WIN",
    "grantedRewards": [
      { "itemId": "GO", "quantity": 30, "customData": null },
      { "itemId": "XP", "quantity": 50, "customData": null },
      { "itemId": "NormalShard", "quantity": 4, "customData": null }
    ],
    "currency": {
      "peasant": 0,
      "gold": 730,
      "gem": 0,
      "normalShard": 4,
      "eliteShard": 0,
      "specialShard": 0
    },
    "statistics": {
      "levelMap": 1,
      "wave": 1,
      "gameCoin": 0,
      "expBattle": 0,
      "levelBattle": 0,
      "level": 2,
      "exp": 0,
      "statPointsAvailable": 0,
      "statPointsSpent": 0,
      "coreStats": {
        "strength": 0,
        "dexterity": 0,
        "constitution": 0,
        "intelligence": 0,
        "wisdom": 0,
        "charisma": 0
      },
      "karma": 0,
      "affinity": 0,
      "luck": 0,
      "resistance": 0,
      "changedName": 0,
      "score": 0,
      "trophy": 0,
      "levelCastle": 0,
      "stageCampaign": 2,
      "battlesPlayed": 1,
      "battlesWon": 1,
      "lobbyUpgradeSpent": 0
    },
    "tutorialProgress": {
      "finishOnboarding": true,
      "finishFirstDeploy": false,
      "isDoneUpgradeUnitTutorial": false
    },
    "questUpdates": [
      {
        "questId": 1,
        "type": "daily",
        "actionId": "PLAY_GAME",
        "progress": 1,
        "required": 3,
        "isCompleted": false,
        "rewardClaimed": false
      },
      {
        "questId": 2,
        "type": "daily",
        "actionId": "WIN_BATTLE",
        "progress": 1,
        "required": 1,
        "isCompleted": true,
        "rewardClaimed": false
      }
    ]
  },
  "serverTime": "2026-05-07T08:46:00.000Z"
}
```

Required rules:

- `grantedRewards` must match exactly what backend persisted.
- The client also accepts legacy `rewards`, but backend should prefer `grantedRewards`.
- `currency` must be the full post-finish currency balance.
- `statistics` must be the full post-finish statistics.
- `questUpdates` must include all changed quests from this battle.
- `GET /me` immediately after finish must return the same `currency`, `statistics`, `tutorialProgress`, and inventory state.
- `GET /quests` immediately after finish must return the same quest progress.
- Same `idempotencyKey` must not grant reward twice.

Invalid behavior:

```json
{
  "grantedRewards": [
    { "itemId": "NormalShard", "quantity": 4 }
  ],
  "currency": {
    "normalShard": 0
  }
}
```

Invalid behavior:

```text
Battle finish returns WIN, but /me after restart returns:
level=1, exp=0, stageCampaign=1, gold=500, normalShard=0, quest progress=0.
```

## Tutorial Reward Requirements

Current active tutorial flags:

| Flag | Meaning |
| --- | --- |
| `finishOnboarding` | Tutorial battle 1 completed |
| `finishFirstDeploy` | Tutorial battle 2 completed |
| `isDoneUpgradeUnitTutorial` | At least one unit upgraded and upgrade tutorial completed |

Required new account state:

```json
{
  "finishOnboarding": false,
  "finishFirstDeploy": false,
  "isDoneUpgradeUnitTutorial": false
}
```

After tutorial battle 1:

```json
{
  "finishOnboarding": true,
  "finishFirstDeploy": false,
  "isDoneUpgradeUnitTutorial": false
}
```

After tutorial battle 2:

```json
{
  "finishOnboarding": true,
  "finishFirstDeploy": true,
  "isDoneUpgradeUnitTutorial": false
}
```

After upgrade tutorial:

```json
{
  "finishOnboarding": true,
  "finishFirstDeploy": true,
  "isDoneUpgradeUnitTutorial": true
}
```

Important:

- `finishFirstDeploy` is a legacy name. Current client uses it as "tutorial battle 2 completed".
- Battle finish must not set `isDoneUpgradeUnitTutorial=true`.
- Upgrade mutation may set `isDoneUpgradeUnitTutorial=true` only after at least one persisted hero has `customData.lv > 1`.

For tutorial battle 2, if the next required action is upgrade Normal unit level 1 -> 2, backend must grant enough spendable resources:

```text
Normal level 1 -> 2 cost = 50 GO + 2 NormalShard
```

Therefore, after tutorial battle 2:

```json
{
  "currency": {
    "gold": 50,
    "normalShard": 2
  }
}
```

minimum balances must be available, or the upgrade tutorial must not be considered ready.

## Fake PvP Contract

Current "PvP" is fake PvP: local client gameplay against AI/fake opponent. It is not real-time multiplayer.

However, fake PvP still needs backend reward persistence.

Current implementation decision:

Unity sends fake PvP reward sessions as `mode: "PVP"` so backend can apply rank/PvP rewards from `ConfigRank`.

Do not use `mode: "PVE"` for the current fake PvP reward flow. If backend treats fake PvP as PVE, Unity will show campaign rewards instead of rank/PvP rewards.

Request:

```json
{
  "mode": "PVP",
  "formationName": "active",
  "configVersion": "2026.05.02.1"
}
```

Required:

- Fake PvP start must return `battleId`.
- Fake PvP finish must persist rewards.
- Fake PvP finish response must include `grantedRewards`, `currency`, `statistics`, and `questUpdates` if applicable.
- `GET /me` after fake PvP finish must return persisted rewards.

## Hero Inventory Contract

`GET /me` and `GET /inventory` must return starter heroes with stable instance IDs:

```json
{
  "instanceId": "p_PLAYER_hi_soldier",
  "itemId": "Soldier",
  "itemType": "hero",
  "itemClass": "Unit",
  "remainingUses": 0,
  "customData": {
    "lv": "1",
    "evlove_lv": "1",
    "evlove_value": "1"
  }
}
```

Required fields:

- `instanceId`
- `itemId`
- `itemType`
- `itemClass`
- `customData.lv`
- `customData.evlove_lv`
- `customData.evlove_value`

Important:

- `evlove_lv` and `evlove_value` are intentionally misspelled legacy client keys.
- Missing `instanceId` causes the client error:

```text
[UIUpgrade] Cannot upgrade Soldier through backend because itemInstanceId is missing.
```

## Hero Upgrade Contract

Endpoint:

```http
POST /api/v1/inventory/heroes/{instanceId}/upgrade
```

Request:

```json
{
  "configVersion": "2026.05.02.1",
  "idempotencyKey": "6d9a5f1b-2d6d-4b16-8cc5-2b0f6e871e62"
}
```

For current client config:

```text
Normal level 1 -> 2 = 50 GO + 2 NormalShard
```

Success response:

```json
{
  "success": true,
  "data": {
    "updatedHero": {
      "instanceId": "p_PLAYER_hi_soldier",
      "itemId": "Soldier",
      "itemType": "hero",
      "itemClass": "Unit",
      "remainingUses": 0,
      "customData": {
        "lv": "2",
        "evlove_lv": "1",
        "evlove_value": "1"
      }
    },
    "consumed": [
      { "itemId": "GO", "quantity": 50 },
      { "itemId": "NormalShard", "quantity": 2 }
    ],
    "currency": {
      "peasant": 0,
      "gold": 680,
      "gem": 0,
      "normalShard": 2,
      "eliteShard": 0,
      "specialShard": 0
    },
    "tutorialProgress": {
      "isDoneUpgradeUnitTutorial": true
    },
    "questUpdates": [
      {
        "questId": 3,
        "type": "daily",
        "actionId": "UPGRADE_UNIT",
        "progress": 1,
        "required": 1,
        "isCompleted": true,
        "rewardClaimed": false
      }
    ]
  }
}
```

Required rules:

- Validate `{instanceId}` belongs to authenticated player.
- Consume exact resources from config.
- Return updated hero with same `instanceId`.
- Return full post-upgrade `currency`.
- Persist hero level before returning success.
- Persist `isDoneUpgradeUnitTutorial=true` only if at least one hero is now level greater than 1.
- Persist `UPGRADE_UNIT` quest progress if applicable.
- `GET /me` after upgrade must return updated hero level and currency.

Invalid behavior:

```text
Player has 4 NormalShard before upgrade, upgrade from level 1 to 2 consumes all 4.
```

Invalid behavior:

```text
Upgrade response succeeds, but /me after restart returns all heroes lv=1.
```

## Quest Contract

`GET /me` and `GET /quests` must return:

```json
{
  "daily": {
    "resetAt": "2026-05-08T00:00:00.000Z",
    "points": 0,
    "quests": [],
    "progressRewards": []
  },
  "weekly": {
    "resetAt": "2026-05-11T00:00:00.000Z",
    "points": 0,
    "quests": [],
    "progressRewards": []
  },
  "achievement": {
    "quests": []
  }
}
```

Each quest item:

```json
{
  "questId": 2,
  "type": "daily",
  "actionId": "WIN_BATTLE",
  "description": "Win 1 battle",
  "progress": 1,
  "required": 1,
  "isCompleted": true,
  "rewardClaimed": false,
  "rewards": [
    { "itemId": "GO", "quantity": 100, "customData": null }
  ]
}
```

Required battle quest updates:

- `PLAY_GAME` +1 on battle finish.
- `WIN_BATTLE` +1 when result is `WIN`.
- `UPGRADE_UNIT` +1 on successful hero upgrade.

Required reset rules:

- Daily/weekly reset only at or after server `resetAt`.
- Before `resetAt`, progress must not reset to `0`.
- Completed unclaimed quests must remain claimable after restart.
- Achievement quests must never reset.

Invalid behavior:

```text
Player wins one battle, WIN_BATTLE becomes completed, then app restarts before resetAt and /quests returns progress=0.
```

## Quest Claim Contract

Endpoint:

```http
POST /api/v1/quests/{questId}/claim
```

Request:

```json
{
  "idempotencyKey": "4e1f5b93-6f5f-4f96-8b4b-5e8f76f5f948"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "quest": {
      "questId": 2,
      "type": "daily",
      "actionId": "WIN_BATTLE",
      "progress": 1,
      "required": 1,
      "isCompleted": true,
      "rewardClaimed": true
    },
    "grantedRewards": [
      { "itemId": "GO", "quantity": 100, "customData": null }
    ],
    "currency": {
      "peasant": 0,
      "gold": 830,
      "gem": 0,
      "normalShard": 2,
      "eliteShard": 0,
      "specialShard": 0
    },
    "dailyPoints": 2,
    "weeklyPoints": 0
  }
}
```

Required rules:

- Claim succeeds only if `isCompleted=true` and `rewardClaimed=false`.
- Claim persists `rewardClaimed=true`.
- Claim response includes post-claim `currency` or `grantedRewards`.
- `GET /quests` after claim returns `rewardClaimed=true`.
- Same `idempotencyKey` does not grant reward twice.

## `GET /me` Full State Requirement

`GET /me` must return a full consistent snapshot:

```json
{
  "playerId": "p_123",
  "username": "player",
  "profile": {},
  "statistics": {},
  "tutorialProgress": {},
  "currency": {},
  "inventory": {
    "heroes": [],
    "skills": []
  },
  "formation": {},
  "quests": {},
  "configVersion": "2026.05.02.1"
}
```

After any mutation, `/me` must not regress persisted values.

Invalid regression examples:

- battle finish returned `gold=730`, later `/me` returns `gold=500`.
- battle finish returned `stageCampaign=2`, later `/me` returns `stageCampaign=1`.
- upgrade returned `Soldier lv=2`, later `/me` returns `Soldier lv=1`.
- quest finish returned `WIN_BATTLE progress=1`, later `/quests` returns `progress=0`.
- tutorial progress returned `isDoneUpgradeUnitTutorial=true`, but inventory has no hero above level 1.

## Error Response Contract

All API errors should use a consistent shape:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_RESOURCES",
    "message": "Not enough resources to upgrade hero"
  },
  "serverTime": "2026-05-07T08:46:00.000Z"
}
```

Known error codes the client handles or logs:

```text
BATTLE_SESSION_MISSING
CONFIG_VERSION_MISSING
HERO_INSTANCE_NOT_FOUND
INSUFFICIENT_RESOURCES
UNAUTHORIZED
VALIDATION_ERROR
```

Error responses must not partially mutate state unless the error explicitly documents a recoverable partial mutation. For the current client, prefer no mutation on error.

## Backend Acceptance Checklist

Use this checklist to verify the backend fix:

### New Account

- `GET /me` returns starter heroes with valid `instanceId`.
- `GET /me` returns `finishOnboarding=false`.
- `GET /me` returns `finishFirstDeploy=false`.
- `GET /me` returns `isDoneUpgradeUnitTutorial=false`.
- `GET /me` returns initial `currency.gold=500` or configured starter amount.

### Tutorial Battle 1

- `/battles/start` returns valid `battleId`.
- `/battles/{battleId}/finish` persists rewards/statistics.
- `finishOnboarding=true`.
- `finishFirstDeploy=false`.
- `/me` after restart does not reset progress.

### Tutorial Battle 2

- `/battles/start` returns valid `battleId`.
- `/finish` persists enough reward for upgrade tutorial if upgrade tutorial should start.
- `finishFirstDeploy=true`.
- `isDoneUpgradeUnitTutorial=false`.
- `currency.normalShard >= 2`.
- `currency.gold >= 50`.
- `/me` after restart returns same currency/statistics.

### Upgrade Tutorial

- Upgrade request uses valid `{instanceId}`.
- Upgrade consumes exactly `50 GO + 2 NormalShard` for Normal level 1 -> 2.
- Response returns `updatedHero.customData.lv="2"`.
- Response returns full post-upgrade `currency`.
- `isDoneUpgradeUnitTutorial=true` only after persisted hero level > 1.
- `/me` after restart returns hero level 2.

### Quest

- Battle finish increments `PLAY_GAME`.
- Battle finish increments `WIN_BATTLE` on win.
- Upgrade increments `UPGRADE_UNIT`.
- Completed unclaimed quest remains claimable after restart.
- Claim persists `rewardClaimed=true`.
- Daily/weekly reset only at or after `resetAt`.

### Fake PvP

- Fake PvP creates a backend battle session before battle starts.
- Fake PvP finish persists rewards through `/battles/{battleId}/finish`.
- `/me` after fake PvP returns reward currency/statistics.
- Fake PvP start uses `mode="PVP"` and must receive PvP/rank rewards.

# Quest Progress API Spec

This document defines the backend contract required by the Unity client for quest progress, quest claiming, and quest reset behavior.

## Related Endpoints

- `GET /api/v1/me`
- `GET /api/v1/quests`
- `POST /api/v1/battles/{battleId}/finish`
- `POST /api/v1/quests/{questId}/claim`
- `POST /api/v1/quests/progress-rewards/{track}/{stage}/claim`

## Source of Truth

When the player is authenticated, backend is the source of truth for quest state.

The Unity client must not locally reset daily or weekly quests for authenticated accounts. Backend must return the correct server-side quest state using `resetAt`.

## Quest Track Shape

`GET /me` and `GET /quests` must return:

```json
{
  "daily": {
    "resetAt": "2026-05-08T00:00:00.000Z",
    "points": 0,
    "quests": [],
    "progressRewards": []
  },
  "weekly": {
    "resetAt": "2026-05-11T00:00:00.000Z",
    "points": 0,
    "quests": [],
    "progressRewards": []
  },
  "achievement": {
    "quests": []
  }
}
```

`daily.progressRewards` and `weekly.progressRewards` must include visible progress reward stages. Unity accepts either singular `reward` or array `rewards`; backend should prefer singular `reward` when each stage grants one item:

```json
{
  "stage": 2,
  "claimed": false,
  "isUnlocked": true,
  "reward": {
    "itemId": "GE",
    "quantity": 50,
    "customData": null
  }
}
```

Equivalent array form:

```json
{
  "stage": 2,
  "claimed": false,
  "isUnlocked": true,
  "rewards": [
    {
      "itemId": "GE",
      "quantity": 50,
      "customData": null
    }
  ]
}
```

## Quest Item Shape

Each quest item must use this shape:

```json
{
  "questId": 1,
  "type": "daily",
  "actionId": "PLAY_GAME",
  "description": "Play 3 battles",
  "progress": 2,
  "required": 3,
  "isCompleted": false,
  "rewardClaimed": false,
  "rewards": [
    {
      "itemId": "GE",
      "quantity": 50,
      "customData": null
    }
  ]
}
```

Required fields:

| Field | Required | Notes |
| --- | --- | --- |
| `questId` | Yes | Stable quest ID. |
| `type` | Yes | One of `daily`, `weekly`, `achievement`. |
| `actionId` | Yes | For example `PLAY_GAME`, `WIN_BATTLE`, `UPGRADE_UNIT`. |
| `progress` | Yes | Current server-side progress. |
| `required` | Yes | Completion target. |
| `isCompleted` | Yes | `true` when `progress >= required`. |
| `rewardClaimed` | Yes | `true` only after the quest reward has been claimed. |
| `rewards` | Yes | Reward list for the quest. |

The Unity client also accepts legacy aliases `taskType`, `completed`, and `claimed`, but backend should prefer `type`, `isCompleted`, and `rewardClaimed`.

## Battle Finish Quest Updates

When a battle ends, backend must persist quest progress before returning the battle finish response.

Endpoint:

```http
POST /api/v1/battles/{battleId}/finish
```

For a completed PVE battle, backend should update at least:

- `PLAY_GAME` by `+1`
- `WIN_BATTLE` by `+1` if result is `WIN`

Response must include `questUpdates`:

```json
{
  "success": true,
  "data": {
    "battleId": "b_123",
    "result": "WIN",
    "questUpdates": [
      {
        "questId": 1,
        "type": "daily",
        "actionId": "PLAY_GAME",
        "progress": 2,
        "required": 3,
        "isCompleted": false,
        "rewardClaimed": false
      },
      {
        "questId": 2,
        "type": "daily",
        "actionId": "WIN_BATTLE",
        "progress": 1,
        "required": 1,
        "isCompleted": true,
        "rewardClaimed": false
      }
    ]
  }
}
```

Required response rules:

- `questUpdates` must contain the updated daily, weekly, and achievement quests affected by the battle.
- `progress` must be the post-mutation persisted progress.
- `isCompleted` must match `progress >= required`.
- `rewardClaimed` must remain `false` until the claim endpoint succeeds.
- `GET /quests` immediately after battle finish must return the same progress.
- `GET /me` immediately after battle finish must return the same quest state if it includes `quests`.

## Expected Two-Battle Case

If the player wins two PVE battles before daily reset:

```json
{
  "daily": {
    "quests": [
      {
        "questId": 1,
        "type": "daily",
        "actionId": "PLAY_GAME",
        "progress": 2,
        "required": 3,
        "isCompleted": false,
        "rewardClaimed": false
      },
      {
        "questId": 2,
        "type": "daily",
        "actionId": "WIN_BATTLE",
        "progress": 1,
        "required": 1,
        "isCompleted": true,
        "rewardClaimed": false
      }
    ]
  }
}
```

The `WIN_BATTLE` quest must be claimable after the first win and must remain claimable after app restart until claimed.

Invalid after two wins:

```json
{
  "questId": 2,
  "type": "daily",
  "actionId": "WIN_BATTLE",
  "progress": 0,
  "required": 1,
  "isCompleted": false,
  "rewardClaimed": false
}
```

The response above is invalid unless a server-side daily reset happened between the battles and the request.

## Quest Claim

Endpoint:

```http
POST /api/v1/quests/{questId}/claim
```

Request:

```json
{
  "idempotencyKey": "4e1f5b93-6f5f-4f96-8b4b-5e8f76f5f948"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "quest": {
      "questId": 2,
      "type": "daily",
      "actionId": "WIN_BATTLE",
      "progress": 1,
      "required": 1,
      "isCompleted": true,
      "rewardClaimed": true
    },
    "grantedRewards": [
      {
        "itemId": "GO",
        "quantity": 100,
        "customData": null
      }
    ],
    "currency": {
      "peasant": 0,
      "gold": 680,
      "gem": 0,
      "normalShard": 2,
      "eliteShard": 0,
      "specialShard": 0
    },
    "dailyPoints": 2,
    "weeklyPoints": 0
  }
}
```

Required claim rules:

- Claim succeeds only if `isCompleted=true` and `rewardClaimed=false`.
- Claim persists `rewardClaimed=true`.
- Claim is idempotent by `idempotencyKey`.
- Claim response must include either full post-claim `currency` or `grantedRewards`.
- If claim response includes `currency`, every returned currency field must already include all `grantedRewards` from this claim. Unity treats `currency` as source of truth and will not add `grantedRewards` on top of it.
- If a quest grants `{ "itemId": "NormalShard", "quantity": 5 }`, then `currency.normalShard` in the same response and in the next `GET /me` must be previous normal shard balance + 5.
- `dailyPoints`/`weeklyPoints` must be post-claim points if the track uses progress rewards.
- `GET /quests` after claim must return `rewardClaimed=true`.

Invalid response example:

```json
{
  "quest": {
    "questId": 102,
    "rewardClaimed": true
  },
  "grantedRewards": [
    {
      "itemId": "NormalShard",
      "quantity": 5
    }
  ],
  "currency": {
    "normalShard": 0
  }
}
```

If the player had `normalShard=0` before claim, the valid response is:

```json
{
  "quest": {
    "questId": 102,
    "rewardClaimed": true
  },
  "grantedRewards": [
    {
      "itemId": "NormalShard",
      "quantity": 5
    }
  ],
  "currency": {
    "normalShard": 5
  }
}
```

## Progress Reward Claim

Endpoint:

```http
POST /api/v1/quests/progress-rewards/{track}/{stage}/claim
```

Success response:

```json
{
  "success": true,
  "data": {
    "track": "daily",
    "stage": 2,
    "claimed": true,
    "grantedRewards": [
      {
        "itemId": "GE",
        "quantity": 50,
        "customData": null
      }
    ],
    "currency": {
      "peasant": 0,
      "gold": 680,
      "gem": 50,
      "normalShard": 2,
      "eliteShard": 0,
      "specialShard": 0
    }
  }
}
```

Required progress reward rules:

- `{track}` must be `daily` or `weekly`.
- Claim succeeds only if current track points are greater than or equal to `{stage}`.
- Claim persists `claimed=true` for that progress reward stage.
- If claim response includes `currency`, it must include the applied progress reward. For example, `NormalShard +5` must make `currency.normalShard` increase by 5 in the response and in the next `GET /me`.
- `GET /quests` after claim must return that stage with `claimed=true`.

## Reset Rules

Backend owns daily and weekly resets for authenticated players.

Required reset behavior:

- `daily.resetAt` must be the next daily reset timestamp.
- `weekly.resetAt` must be the next weekly reset timestamp.
- Before `resetAt`, backend must not reset quest progress to zero.
- At or after `resetAt`, backend may reset daily/weekly progress and claimed state.
- Achievement quests must not reset.

## Backend Fix Checklist

- Battle finish persists `PLAY_GAME` progress.
- Battle finish persists `WIN_BATTLE` progress for wins.
- Battle finish returns typed `questUpdates`, not only untyped objects.
- `/quests` after battle returns updated progress.
- `/me` after battle returns updated progress if it includes quests.
- Quest items use `type`, `isCompleted`, and `rewardClaimed`.
- `rewardClaimed=false` completed quests remain claimable after app restart.
- Claim persists `rewardClaimed=true`.
- Daily/weekly progress resets only when server time reaches `resetAt`.
- Achievement progress never resets.

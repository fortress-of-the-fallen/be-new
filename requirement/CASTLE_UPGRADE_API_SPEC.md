# Backend Spec: Castle Upgrade API

## Purpose

Unity currently has an "Upgrade Castle" popup in the lobby. The feature upgrades the player's lobby/castle progression by spending gold.

At the moment, Unity can only apply this locally. Backend already returns these fields in player statistics:

- `levelCastle`
- `lobbyUpgradeSpent`

But there is no server-side mutate endpoint for upgrading the castle. This means the local castle upgrade can be lost after `GET /me`, relogin, or app restart.

This spec defines the backend API required to make castle upgrade server-authoritative.

## Endpoint

```http
POST /api/v1/lobby/castle/upgrade
Authorization: Bearer <accessToken>
Content-Type: application/json
```

## Request

```json
{
  "configVersion": "2026.05.02.1",
  "idempotencyKey": "0f3d6a26-5c0d-4c27-8b66-2d7c3d7db6d7"
}
```

Fields:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `configVersion` | string | yes | Active config version used by the Unity client. |
| `idempotencyKey` | string | yes | Prevents duplicate gold spending when request is retried. |

## Config Source

Backend must use active `ConfigLobby` data for castle upgrade cost and level thresholds.

Unity currently uses tier 1 only:

```csharp
int tier = 1;
```

Relevant config fields:

| Field | Meaning |
| --- | --- |
| `Tier` | Castle/lobby tier. Currently Unity uses `Tier = 1`. |
| `Level` | Castle level. |
| `CostTotal` | Total accumulated gold required to reach this level. |

Unity also uses a fixed per-click spend:

```csharp
upgradeCostFixed = 125
```

Backend should mirror this behavior unless config introduces a server-defined per-click cost.

## Server Logic

Pseudo-code:

```ts
const tier = 1;
const currentLevel = player.statistics.levelCastle ?? 0;
const currentSpent = player.statistics.lobbyUpgradeSpent ?? 0;
const maxLevel = max(ConfigLobby where Tier == 1).Level;

if (currentLevel >= maxLevel) {
  throw MAX_CASTLE_LEVEL;
}

const totalTierCost = max(ConfigLobby where Tier == 1).CostTotal;
const remainingToMax = totalTierCost - currentSpent;
const spend = Math.min(125, remainingToMax);

if (spend <= 0) {
  throw MAX_CASTLE_LEVEL;
}

if (player.currency.gold < spend) {
  throw INSUFFICIENT_GOLD;
}

player.currency.gold -= spend;
player.statistics.lobbyUpgradeSpent = currentSpent + spend;

let newLevel = 0;
for (const row of ConfigLobby where Tier == 1 ordered by Level asc) {
  if (player.statistics.lobbyUpgradeSpent >= row.CostTotal) {
    newLevel = row.Level;
  }
}

player.statistics.levelCastle = Math.min(newLevel, maxLevel);

save(player);
```

## Response

Backend must return full post-upgrade state for the changed fields.

```json
{
  "success": true,
  "data": {
    "levelCastle": 1,
    "lobbyUpgradeSpent": 125,
    "spentGold": 125,
    "currency": {
      "peasant": 0,
      "gold": 605,
      "gem": 0,
      "normalShard": 4,
      "eliteShard": 1,
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
      "score": 35,
      "trophy": 35,
      "levelCastle": 1,
      "stageCampaign": 2,
      "battlesPlayed": 2,
      "battlesWon": 2,
      "lobbyUpgradeSpent": 125
    }
  },
  "serverTime": "2026-05-09T06:30:00.000Z"
}
```

Minimum required response fields:

```json
{
  "levelCastle": 1,
  "lobbyUpgradeSpent": 125,
  "spentGold": 125,
  "currency": {
    "gold": 605
  },
  "statistics": {
    "levelCastle": 1,
    "lobbyUpgradeSpent": 125
  }
}
```

## Error Responses

### Not enough gold

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_GOLD",
    "message": "Not enough gold to upgrade castle"
  },
  "serverTime": "2026-05-09T06:30:00.000Z"
}
```

### Max castle level

```json
{
  "success": false,
  "error": {
    "code": "MAX_CASTLE_LEVEL",
    "message": "Castle is already at max level"
  },
  "serverTime": "2026-05-09T06:30:00.000Z"
}
```

### Config version mismatch

```json
{
  "success": false,
  "error": {
    "code": "CONFIG_VERSION_MISMATCH",
    "message": "Client config version is not active"
  },
  "serverTime": "2026-05-09T06:30:00.000Z"
}
```

## Idempotency

Backend must store the result for `(playerId, idempotencyKey)`.

If Unity retries the same request with the same key:

- do not deduct gold again
- do not increase `lobbyUpgradeSpent` again
- return the original successful response

## GET /me Contract

After a successful castle upgrade, `GET /api/v1/me` must return the persisted values:

```json
{
  "statistics": {
    "levelCastle": 1,
    "lobbyUpgradeSpent": 125
  },
  "currency": {
    "gold": 605
  }
}
```

Unity must be able to reload these values after app restart or relogin.

## Acceptance Tests

### Case 1: First castle upgrade click

Initial state:

```json
{
  "currency": {
    "gold": 730
  },
  "statistics": {
    "levelCastle": 0,
    "lobbyUpgradeSpent": 0
  }
}
```

Request:

```http
POST /api/v1/lobby/castle/upgrade
```

Expected response:

```json
{
  "currency": {
    "gold": 605
  },
  "statistics": {
    "lobbyUpgradeSpent": 125
  },
  "spentGold": 125
}
```

`levelCastle` depends on `ConfigLobby.CostTotal`.

If the first level threshold is `125`, expected:

```json
{
  "statistics": {
    "levelCastle": 1,
    "lobbyUpgradeSpent": 125
  }
}
```

### Case 2: Not enough gold

Initial state:

```json
{
  "currency": {
    "gold": 50
  },
  "statistics": {
    "levelCastle": 0,
    "lobbyUpgradeSpent": 0
  }
}
```

Expected:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_GOLD"
  }
}
```

State must not change.

### Case 3: Retry same idempotency key

Initial successful request spends 125 gold.

Retry same request:

```json
{
  "idempotencyKey": "same-key"
}
```

Expected:

- same response as first request
- no additional gold deduction
- no additional `lobbyUpgradeSpent`

### Case 4: Max level

Initial state:

```json
{
  "statistics": {
    "levelCastle": 5,
    "lobbyUpgradeSpent": 2000
  }
}
```

If level 5 is max for tier 1, expected:

```json
{
  "success": false,
  "error": {
    "code": "MAX_CASTLE_LEVEL"
  }
}
```

## Unity Integration Notes

Once this API exists, Unity should update `UISetupBattle.OnClickedUpgradeCastle()` to:

1. Check auth state.
2. Call `POST /api/v1/lobby/castle/upgrade`.
3. On success, apply returned `currency` and `statistics`.
4. Refresh gold text, castle sprite/model, percent text, and upgrade cost.
5. On failure, show backend error tip and do not apply local mutation.

Until this endpoint exists, castle upgrade is local-only and can regress after backend sync.

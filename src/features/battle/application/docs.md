# Battle Docs

Tài liệu này mô tả start/finish battle session theo implementation hiện tại.

- Base path: `/api/v1/battles`
- Protected routes: yêu cầu `Authorization: Bearer <accessToken>`
- Thành công dùng envelope `{ success, data, serverTime }`
- `start` phụ thuộc `configVersion`; `finish` phụ thuộc `idempotencyKey`

## Routes

<details>
<summary><strong>Start Battle - <code>POST /api/v1/battles/start</code></strong></summary>

**Mô tả route**

Khởi tạo battle session server-side, sinh `battleId`, `seed`, snapshot opponent và `expiresAt`.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

```json
{
  "mode": "PVP",
  "formationName": "active",
  "configVersion": "2026.05.02.1"
}
```

Ghi chú:
- `mode`: `PVP` hoặc `PVE`.
- `formationName`: phải tồn tại ở player hiện tại.
- `PVP` yêu cầu server tìm được ít nhất một opponent khả dụng.

**Output Schema**

```json
{
  "success": true,
  "data": {
    "battleId": "b_j8kw9z0n3x",
    "mode": "PVP",
    "seed": 345678901,
    "opponent": {
      "playerId": "p_enemy_001",
      "displayName": "Enemy One",
      "avatar": "normal",
      "score": 98,
      "formation": [
        {
          "slot": 0,
          "unitName": "Soldier",
          "position": {
            "x": 0,
            "y": 0,
            "z": 0
          }
        }
      ]
    },
    "configVersion": "2026.05.02.1",
    "expiresAt": "2026-05-05T10:15:00.000Z"
  },
  "serverTime": "2026-05-05T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `VALIDATION_FAILED` | Body sai schema hoặc `mode` không nằm trong `PVP | PVE`. |
| `CONFIG_MISMATCH` | `configVersion` client không trùng active server config. |
| `NOT_FOUND` | Không tìm thấy formation hoặc không có opponent cho `PVP`. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/battles/start' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "mode": "PVP",
    "formationName": "active",
    "configVersion": "2026.05.02.1"
  }'
```

</details>

<details>
<summary><strong>Finish Battle - <code>POST /api/v1/battles/:battleId/finish</code></strong></summary>

**Mô tả route**

Hoàn tất battle session, grant reward, cập nhật quest progress, đồng bộ leaderboard, và trả về state mới để client sync ngay sau trận.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Path param:
- `battleId: string`

Body:

```json
{
  "result": "WIN",
  "durationSec": 82,
  "winCondition": "DestroyAllTarget",
  "playerPercent": 0.63,
  "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00021"
}
```

Ghi chú:
- `result`: `WIN | LOSE | DRAW`.
- `durationSec`: `1..3600`.
- `playerPercent`: `0..1`.
- Với config mặc định hiện tại, `PVE + DRAW` không có reward rule nên sẽ trả `NOT_FOUND`.

**Output Schema**

```json
{
  "success": true,
  "data": {
    "battleId": "b_j8kw9z0n3x",
    "result": "WIN",
    "grantedRewards": [
      {
        "itemId": "GO",
        "quantity": 100,
        "customData": null
      },
      {
        "itemId": "XP",
        "quantity": 20,
        "customData": null
      },
      {
        "itemId": "Trophy",
        "quantity": 3,
        "customData": null
      }
    ],
    "statistics": {
      "level": 1,
      "exp": 20,
      "score": 3,
      "trophy": 3,
      "stageCampaign": 2,
      "battlesPlayed": 1,
      "battlesWon": 1
    },
    "tutorialProgress": {
      "finishOnboarding": true,
      "finishIntro": true,
      "finishFirstDeploy": true,
      "finishFirstBattle": true,
      "finishFirstDragUnit": true,
      "finishFirstDeployArcher": true,
      "finishFirstDeployBarricade": true,
      "finishFirstDeployCavalry": true,
      "finishUpgradeArcher": true,
      "finishUpgradeBase": true,
      "finishUpgradeUnitStat": true,
      "finishPurchaseSkill": true,
      "finishPvP": true,
      "isDoneUpgradeUnitTutorial": true,
      "updatedAt": "2026-05-05T10:00:01.000Z"
    },
    "playerDelta": {
      "levelBefore": 1,
      "levelAfter": 1,
      "scoreBefore": 0,
      "scoreAfter": 3,
      "expBefore": 0,
      "expAfter": 20
    },
    "currency": {
      "peasant": 0,
      "gold": 600,
      "gem": 0,
      "normalShard": 1,
      "eliteShard": 0,
      "specialShard": 0
    },
    "questUpdates": [
      {
        "questId": 1,
        "type": "daily",
        "progress": 1,
        "required": 3,
        "isCompleted": false,
        "rewardClaimed": false
      }
    ]
  },
  "serverTime": "2026-05-05T10:00:00.000Z"
}
```

Ghi chú:
- `grantedRewards` là danh sách reward canonical cho client mới.
- Response hiện vẫn giữ `rewards` như alias compatibility với contract cũ.
- Khi `mode = PVE` và `result = WIN`, server tăng `statistics.stageCampaign`, `statistics.battlesPlayed`, `statistics.battlesWon`.
- Ở chiến thắng onboarding đầu tiên, server đánh dấu `finishOnboarding`, `finishIntro`, `finishFirstDeploy`, `finishFirstBattle`.

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `VALIDATION_FAILED` | Body sai schema hoặc thiếu `idempotencyKey`. |
| `NOT_FOUND` | Không tìm thấy battle session hoặc reward rule theo mode/result. |
| `BATTLE_ALREADY_FINISHED` | Battle này đã được finish trước đó. |
| `BATTLE_EXPIRED` | Battle quá hạn claim reward. |
| `IDEMPOTENCY_CONFLICT` | Cùng `idempotencyKey` nhưng payload khác. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/battles/b_j8kw9z0n3x/finish' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "result": "WIN",
    "durationSec": 82,
    "winCondition": "DestroyAllTarget",
    "playerPercent": 0.63,
    "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00021"
  }'
```

</details>

## Quick Links

- API Portal: [/](/)
- Swagger Battle: [/swagger/battle](/swagger/battle)
- Player Docs: [/docs/player](/docs/player)
- Leaderboard Docs: [/docs/leaderboard](/docs/leaderboard)

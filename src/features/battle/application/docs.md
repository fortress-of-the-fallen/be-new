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
- `mode`: `PVP`, `PVE`, hoặc `FAKE_PVP`.
- `formationName`: phải tồn tại ở player hiện tại.
- `PVP` và `FAKE_PVP` đều mở được battle reward session theo flow rank/fake PvP; current Unity client đang gửi `mode = PVP`.
- Với `PVP`, server có thể kèm snapshot `opponent` nếu đang tìm được candidate, nhưng không block session creation nếu chưa có opponent khả dụng.
- `FAKE_PVP` vẫn được hỗ trợ như alias compatibility cho client/backend flow cũ.

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
| `VALIDATION_FAILED` | Body sai schema hoặc `mode` không nằm trong `PVP | PVE | FAKE_PVP`. |
| `CONFIG_VERSION_MISSING` | Thiếu `configVersion` trong request body. |
| `CONFIG_VERSION_MISMATCH` | `configVersion` client không trùng active server config. |
| `NOT_FOUND` | Không tìm thấy formation. |

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
- `PVE` trước khi hoàn tất onboarding (`finishOnboarding=false`) chỉ grant `100 GO` khi `WIN`; `LOSE` hoặc `DRAW` không grant onboarding reward.
- `PVE` sau onboarding tính `GO` theo campaign formula: `WIN = floor(baseGold * (playerPercent + 0.5))`, `DRAW = floor(baseGold * 0.75)`, `LOSE = floor(baseGold / 2)`.
- Với active config mặc định hiện tại, `ConfigCampaign[1].goldReward = 200`, nên chiến thắng campaign ở stage reward 1 với `playerPercent = 0.96` sẽ grant `292 GO`.
- `FAKE_PVP` và `PVP` dùng rank reward theo `score` trước khi finish; tân thủ `0..99 trophy` hiện grant đúng bảng Rookie trong spec.

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
        "quantity": 130,
        "customData": null
      },
      {
        "itemId": "XP",
        "quantity": 50,
        "customData": null
      },
      {
        "itemId": "Trophy",
        "quantity": 35,
        "customData": null
      },
      {
        "itemId": "NormalShard",
        "quantity": 4,
        "customData": null
      },
      {
        "itemId": "EliteShard",
        "quantity": 1,
        "customData": null
      }
    ],
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
      "isDoneUpgradeUnitTutorial": false,
      "updatedAt": "2026-05-05T10:00:01.000Z"
    },
    "playerDelta": {
      "levelBefore": 1,
      "levelAfter": 2,
      "scoreBefore": 0,
      "scoreAfter": 35,
      "expBefore": 0,
      "expAfter": 0
    },
    "currency": {
      "peasant": 0,
      "gold": 730,
      "gem": 0,
      "normalShard": 4,
      "eliteShard": 1,
      "specialShard": 0
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
      },
      {
        "questId": 4,
        "type": "weekly",
        "actionId": "PLAY_GAME",
        "progress": 1,
        "required": 20,
        "isCompleted": false,
        "rewardClaimed": false
      },
      {
        "questId": 8,
        "type": "achievement",
        "actionId": "WIN_BATTLE",
        "progress": 1,
        "required": 25,
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
- Mọi battle `WIN` sẽ đẩy active tutorial progress thêm tối đa một bước (`finishOnboarding` rồi `finishFirstDeploy`); battle finish không bao giờ tự set `isDoneUpgradeUnitTutorial`.
- Chỉ `PVE + WIN` mới tăng `statistics.stageCampaign`, `statistics.battlesPlayed`, `statistics.battlesWon`.
- `FAKE_PVP` và `PVP` không coi là campaign battle, nhưng vẫn persist reward theo rank bracket và có thể hoàn tất tutorial battle 2 nếu đó là chiến thắng kế tiếp sau onboarding.
- `XP` được xử lý theo exp-inside-current-level: ở ngưỡng exact threshold (`0 + 50 XP` với level 1 hiện tại), response phải trả `statistics.level = 2` và `statistics.exp = 0`, không được giữ `level = 1, exp = 50`.
- `questUpdates` trả progress đã persist cho các quest daily, weekly, achievement thuộc active `ConfigQuest`.
- Ở chiến thắng onboarding đầu tiên, server chỉ grant `100 GO` và đánh dấu active flag `finishOnboarding`.
- Sau đó, chiến thắng fake PvP kiểu Rookie sẽ grant base rank reward `30 GO + 50 XP + 35 Trophy + 4 NormalShard + 1 EliteShard`; nếu trận đó đồng thời đủ XP lên level 2 thì response runtime hiện tại sẽ merge thêm reward level-up từ `accountLevel`, nên `grantedRewards` thực tế là `GO 130 + XP 50 + Trophy 35 + 4 NormalShard + 1 EliteShard`.
- `GET /api/v1/me` gọi ngay sau battle finish phải trả cùng `currency` và `statistics` như response finish của trận đó.
- Retry cùng payload với cùng `idempotencyKey` sẽ trả lại response gốc đã lưu và không tạo thêm reward transaction hay cộng reward lần hai.

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

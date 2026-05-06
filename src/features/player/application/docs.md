# Player Docs

Tài liệu này mô tả hydration player state và các cập nhật state trực tiếp cho player hiện tại.

- Base path: `/api/v1/me`
- Protected routes: yêu cầu `Authorization: Bearer <accessToken>`
- Thành công dùng envelope `{ success, data, serverTime }`

## Routes

<details>
<summary><strong>Get Current Player - <code>GET /api/v1/me</code></strong></summary>

**Mô tả route**

Trả về player state hợp nhất cho client bootstrap: profile, statistics, tutorial progress, currency, inventory, formation, quest state và `configVersion`.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Không có body request.

**Output Schema**

```json
{
  "success": true,
  "data": {
    "playerId": "p_abc123",
    "profile": {
      "username": "player01",
      "displayName": "Player01",
      "avatar": "normal",
      "country": "VN"
    },
    "statistics": {
      "level": 1,
      "exp": 0,
      "score": 0,
      "trophy": 0,
      "stageCampaign": 1,
      "battlesPlayed": 0,
      "battlesWon": 0,
      "changedName": 0
    },
    "tutorialProgress": {
      "finishOnboarding": false,
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
      "updatedAt": "2026-05-05T10:00:00.000Z"
    },
    "currency": {
      "peasant": 0,
      "gold": 500,
      "gem": 0,
      "normalShard": 0,
      "eliteShard": 0,
      "specialShard": 0
    },
    "inventory": {
      "heroes": [
        {
          "instanceId": "p_abc123_hi_soldier",
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
      ],
      "skills": []
    },
    "formation": {
      "name": "active",
      "slots": [
        {
          "slot": 0,
          "unitName": "Soldier",
          "position": {
            "x": 0,
            "y": 0,
            "z": 0
          }
        },
        {
          "slot": 1,
          "unitName": "Archer",
          "position": {
            "x": 0,
            "y": 0,
            "z": 0
          }
        },
        {
          "slot": 2,
          "unitName": "Prophet",
          "position": {
            "x": 0,
            "y": 0,
            "z": 0
          }
        }
      ]
    },
    "quests": {
      "daily": {
        "resetAt": "2026-05-05T00:00:00.000Z",
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
    },
    "configVersion": "2026.05.02.1"
  },
  "serverTime": "2026-05-05T10:00:00.000Z"
}
```

Ghi chú:
- `tutorialProgress` là source of truth để Unity đồng bộ onboarding/tutorial giữa nhiều thiết bị.
- `statistics.stageCampaign`, `statistics.battlesPlayed`, `statistics.battlesWon` luôn được hydrate về dạng số.
- Legacy account chưa có `tutorialProgress` sẽ được normalize an toàn từ statistics hiện tại, không reset onboarding về `false` nếu account đã có tiến trình.

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc access token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `NOT_FOUND` | Không tìm thấy player tương ứng với token hiện tại. |

**Sample curl**

```bash
curl -X GET 'http://127.0.0.1:3000/api/v1/me' \
  -H 'Authorization: Bearer <access-token>'
```

</details>

<details>
<summary><strong>Update Profile - <code>PATCH /api/v1/me/profile</code></strong></summary>

**Mô tả route**

Cập nhật `displayName`, `avatar`, `country`. Request này idempotent theo `idempotencyKey`. Việc đổi tên dùng cost rule từ config `upgrade`.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

```json
{
  "displayName": "Player Renamed",
  "avatar": "avatar_01",
  "country": "VN",
  "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00001"
}
```

Ghi chú:
- Có thể gửi một phần field.
- `displayName`: 3-32 ký tự.
- `avatar`: phải tồn tại trong config `spriteResource`.
- `country`: được uppercase trước khi lưu.

**Output Schema**

```json
{
  "success": true,
  "data": {
    "profile": {
      "displayName": "Player Renamed",
      "avatar": "avatar_01",
      "country": "VN"
    },
    "currency": {
      "peasant": 0,
      "gold": 500,
      "gem": 0,
      "normalShard": 0,
      "eliteShard": 0,
      "specialShard": 0
    }
  },
  "serverTime": "2026-05-05T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `VALIDATION_FAILED` | Body sai schema, `displayName` quá ngắn, `avatar` không hợp lệ, hoặc thiếu `idempotencyKey`. |
| `IDEMPOTENCY_CONFLICT` | Cùng `idempotencyKey` nhưng payload khác với request trước. |
| `INSUFFICIENT_RESOURCE` | Không đủ currency cho rename rule hiện tại. |
| `NOT_FOUND` | Không tìm thấy player để cập nhật. |

**Sample curl**

```bash
curl -X PATCH 'http://127.0.0.1:3000/api/v1/me/profile' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "displayName": "Player Renamed",
    "avatar": "avatar_01",
    "country": "VN",
    "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00001"
  }'
```

</details>

<details>
<summary><strong>Update Tutorial Progress - <code>PATCH /api/v1/me/tutorial-progress</code></strong></summary>

**Mô tả route**

Client gọi route này mỗi khi hoàn thành một tutorial step. Server chỉ chấp nhận allowlist boolean field đã biết và chỉ cho phép cập nhật monotonic mặc định (`false -> true`).

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

```json
{
  "updates": {
    "finishOnboarding": true,
    "finishFirstBattle": true,
    "finishFirstDeploy": true,
    "isDoneUpgradeUnitTutorial": true
  },
  "clientUpdatedAt": "2026-05-05T10:00:00.000Z"
}
```

Ghi chú:
- `updates` phải là object.
- Chỉ chấp nhận các field tutorial đã định nghĩa.
- Unknown field sẽ trả `VALIDATION_FAILED`.
- `true -> false` bị reject trên endpoint này.

**Output Schema**

```json
{
  "success": true,
  "data": {
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
    }
  },
  "serverTime": "2026-05-05T10:00:01.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc access token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `VALIDATION_FAILED` | `updates` rỗng, unknown field, value không phải boolean, hoặc cố chuyển `true -> false`. |
| `NOT_FOUND` | Không tìm thấy player để cập nhật. |

**Sample curl**

```bash
curl -X PATCH 'http://127.0.0.1:3000/api/v1/me/tutorial-progress' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "updates": {
      "finishOnboarding": true,
      "finishFirstBattle": true,
      "finishFirstDeploy": true,
      "isDoneUpgradeUnitTutorial": true
    },
    "clientUpdatedAt": "2026-05-05T10:00:00.000Z"
  }'
```

</details>

## Quick Links

- API Portal: [/](/)
- Swagger Player: [/swagger/player](/swagger/player)
- Auth Docs: [/docs/auth](/docs/auth)
- Battle Docs: [/docs/battle](/docs/battle)
- Quest Docs: [/docs/quest](/docs/quest)

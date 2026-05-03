# Quest Docs

Tài liệu này mô tả quest state, claim quest reward và claim progress reward.

- Base path: `/api/v1/quests`
- Protected routes: yêu cầu `Authorization: Bearer <accessToken>`
- Thành công dùng envelope `{ success, data, serverTime }`

## Routes

<details>
<summary><strong>Get Quests - <code>GET /api/v1/quests</code></strong></summary>

**Mô tả route**

Trả về toàn bộ quest state hiện tại, gồm `daily`, `weekly`, `achievement` và progress rewards.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Không có body request.

**Output Schema**

```json
{
  "success": true,
  "data": {
    "daily": {
      "resetAt": "2026-05-05T00:00:00.000Z",
      "points": 2,
      "quests": [
        {
          "questId": 1,
          "type": "daily",
          "actionId": "PLAY_GAME",
          "description": "Play 3 battles",
          "progress": 1,
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
      ],
      "progressRewards": [
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
      ]
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
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `INTERNAL_SERVER_ERROR` | Lỗi ngoài ý muốn khi dựng quest state. |

**Sample curl**

```bash
curl -X GET 'http://127.0.0.1:3000/api/v1/quests' \
  -H 'Authorization: Bearer <access-token>'
```

</details>

<details>
<summary><strong>Claim Quest Reward - <code>POST /api/v1/quests/:questId/claim</code></strong></summary>

**Mô tả route**

Claim reward của một quest đã hoàn thành. Request idempotent theo `idempotencyKey`.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Path param:
- `questId: integer`

Body:

```json
{
  "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00001"
}
```

**Output Schema**

```json
{
  "success": true,
  "data": {
    "quest": {
      "questId": 1,
      "type": "daily",
      "progress": 3,
      "required": 3,
      "isCompleted": true,
      "rewardClaimed": true
    },
    "grantedRewards": [
      {
        "itemId": "GE",
        "quantity": 50,
        "customData": null
      }
    ],
    "currency": {
      "peasant": 0,
      "gold": 500,
      "gem": 50,
      "normalShard": 0,
      "eliteShard": 0,
      "specialShard": 0
    },
    "dailyPoints": 2
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `VALIDATION_FAILED` | Thiếu `idempotencyKey`, `questId` không parse được, hoặc quest chưa hoàn thành. |
| `NOT_FOUND` | Không tìm thấy quest state hoặc quest definition. |
| `ALREADY_CLAIMED` | Quest đã được claim trước đó. |
| `IDEMPOTENCY_CONFLICT` | Cùng `idempotencyKey` nhưng payload khác. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/quests/1/claim' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00001"
  }'
```

</details>

<details>
<summary><strong>Claim Progress Reward - <code>POST /api/v1/quests/progress-rewards/:track/:stage/claim</code></strong></summary>

**Mô tả route**

Claim reward mốc điểm của `daily` hoặc `weekly` track. Request idempotent theo `idempotencyKey`.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Path params:
- `track: daily | weekly`
- `stage: integer`

Body:

```json
{
  "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00002"
}
```

**Output Schema**

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
      "gold": 500,
      "gem": 100,
      "normalShard": 0,
      "eliteShard": 0,
      "specialShard": 0
    }
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `VALIDATION_FAILED` | Thiếu `idempotencyKey`, `stage` không parse được, hoặc reward chưa unlock. |
| `NOT_FOUND` | Không tìm thấy progress reward ở `track/stage` đã yêu cầu. |
| `ALREADY_CLAIMED` | Mốc reward đã claim trước đó. |
| `IDEMPOTENCY_CONFLICT` | Cùng `idempotencyKey` nhưng payload khác. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/quests/progress-rewards/daily/2/claim' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00002"
  }'
```

</details>

## Quick Links

- API Portal: [/](/)
- Swagger Quest: [/swagger/quest](/swagger/quest)
- Battle Docs: [/docs/battle](/docs/battle)

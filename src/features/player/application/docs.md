# Player Docs

Tài liệu này mô tả hydration và cập nhật profile cho player hiện tại.

- Base path: `/api/v1/me`
- Protected routes: yêu cầu `Authorization: Bearer <accessToken>`
- Thành công dùng envelope `{ success, data, serverTime }`

## Routes

<details>
<summary><strong>Get Current Player - <code>GET /api/v1/me</code></strong></summary>

**Mô tả route**

Trả về player state hợp nhất cho client bootstrap: profile, statistics, currency, inventory, formation, quest state và `configVersion`.

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
      "displayName": "Player01",
      "avatar": "normal",
      "country": "VN"
    },
    "statistics": {
      "level": 1,
      "exp": 0,
      "score": 0,
      "stageCampaign": 1,
      "changedName": 0
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
          "instanceId": "hi_soldier_001",
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
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

Ghi chú:
- `profile`, `statistics`, `currency` là object server-authoritative
- `inventory.heroes` và `inventory.skills` được tách theo `itemType`
- `formation` hiện hydrate formation tên `active`

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
- Có thể gửi một phần field
- `displayName`: 3-32 ký tự
- `avatar`: phải tồn tại trong config `spriteResource`
- `country`: được uppercase trước khi lưu

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
  "serverTime": "2026-05-04T10:00:00.000Z"
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

## Quick Links

- API Portal: [/](/)
- Swagger Player: [/swagger/player](/swagger/player)
- Auth Docs: [/docs/auth](/docs/auth)
- Quest Docs: [/docs/quest](/docs/quest)

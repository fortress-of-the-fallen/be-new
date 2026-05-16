# Lobby Docs

Tài liệu này mô tả mutate flow cho lobby/castle progression.

- Base path: `/api/v1/lobby`
- Protected routes: yêu cầu `Authorization: Bearer <accessToken>`
- Thành công dùng envelope `{ success, data, serverTime }`
- Mutation phụ thuộc `configVersion` và `idempotencyKey`

## Routes

<details>
<summary><strong>Upgrade Castle - <code>POST /api/v1/lobby/castle/upgrade</code></strong></summary>

**Mô tả route**

Tiêu gold theo từng click để tăng `statistics.lobbyUpgradeSpent`, tính lại `statistics.levelCastle` theo active `ConfigLobby`, rồi trả full state sau khi persist.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

```json
{
  "configVersion": "2026.05.02.1",
  "idempotencyKey": "0f3d6a26-5c0d-4c27-8b66-2d7c3d7db6d7"
}
```

Ghi chú:
- Tier hiện tại cố định là `1`.
- Active defaults hiện dùng click spend `125 GO` mỗi lần.
- `levelCastle` được resolve từ active `lobby` config theo `CostTotal`.

**Output Schema**

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
      "level": 2,
      "exp": 0,
      "score": 35,
      "trophy": 35,
      "levelCastle": 1,
      "stageCampaign": 2,
      "battlesPlayed": 1,
      "battlesWon": 1,
      "lobbyUpgradeSpent": 125
    }
  },
  "serverTime": "2026-05-09T06:30:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `VALIDATION_FAILED` | Thiếu `idempotencyKey` hoặc body sai schema. |
| `CONFIG_VERSION_MISSING` | Thiếu `configVersion` trong request body. |
| `CONFIG_VERSION_MISMATCH` | `configVersion` client không trùng active server config. |
| `INSUFFICIENT_GOLD` | Không đủ gold để spend click nâng castle tiếp theo. |
| `MAX_CASTLE_LEVEL` | Castle tier hiện tại đã đạt max level hoặc max accumulated cost. |
| `IDEMPOTENCY_CONFLICT` | Cùng `idempotencyKey` nhưng payload khác request cũ. |
| `NOT_FOUND` | Không tìm thấy player hoặc active `lobby` config. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/lobby/castle/upgrade' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "configVersion": "2026.05.02.1",
    "idempotencyKey": "0f3d6a26-5c0d-4c27-8b66-2d7c3d7db6d7"
  }'
```

</details>

## Quick Links

- API Portal: [/](/)
- Swagger Lobby: [/swagger/lobby](/swagger/lobby)
- Player Docs: [/docs/player](/docs/player)
- Config Docs: [/docs/config](/docs/config)

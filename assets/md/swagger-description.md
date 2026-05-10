# API Documentation

Tài liệu mô tả contract `/api/v1` hiện đang chạy trong backend.

## Navigation

- API Portal: [/](/)
- Swagger All: [/swagger](/swagger)
- Swagger Auth: [/swagger/auth](/swagger/auth)
- Swagger Character: [/swagger/character](/swagger/character)
- Swagger Player: [/swagger/player](/swagger/player)
- Swagger Inventory: [/swagger/inventory](/swagger/inventory)
- Swagger Formation: [/swagger/formation](/swagger/formation)
- Swagger Quest: [/swagger/quest](/swagger/quest)
- Swagger Battle: [/swagger/battle](/swagger/battle)
- Swagger Leaderboard: [/swagger/leaderboard](/swagger/leaderboard)
- Swagger Config: [/swagger/config](/swagger/config)

## Authentication

- Protected endpoints dùng `Authorization: Bearer <accessToken>`
- `register`, `login`, `refresh` là public
- `configs` là public
- `logout` cần cả bearer token và `refreshToken` trong body

## Response Envelopes

### Standard Success

```json
{
  "success": true,
  "data": {},
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

### Standard Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": {}
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

### Character Compatibility Success

```json
{
  "success": true,
  "errorCode": "",
  "error": "",
  "timestamp": "2026-05-04T10:00:00.000Z",
  "result": {}
}
```

Ghi chú:
- Hầu hết feature mới đã chuyển sang `data/serverTime`
- `character` vẫn dùng compatibility success envelope để tránh phá flow cũ
- Các lỗi auth/guard ở `character` vẫn đi qua global error envelope mới

## Common Error Codes

| Error code | Ý nghĩa |
| --- | --- |
| `UNAUTHORIZED` | Thiếu token, token sai format, token hết hạn, hoặc refresh token không hợp lệ. |
| `FORBIDDEN` | Token hợp lệ nhưng role không được phép gọi route. |
| `VALIDATION_FAILED` | Body/query/path sai schema hoặc rule validation thất bại. |
| `NOT_FOUND` | Không tìm thấy resource, config, battle, formation, player, hero, skill hoặc leaderboard row. |
| `USERNAME_TAKEN` | Username đã được đăng ký. |
| `INVALID_CREDENTIALS` | Sai username/password hoặc account không active. |
| `INSUFFICIENT_GOLD` | Không đủ gold cho mutation yêu cầu spend gold cố định, ví dụ castle upgrade. |
| `INSUFFICIENT_RESOURCE` | Không đủ gold/gem/shard hoặc thiếu duplicate copies. |
| `ALREADY_CLAIMED` | Quest reward hoặc progress reward đã được claim. |
| `MAX_CASTLE_LEVEL` | Castle tier hiện tại đã đạt max level/max accumulated cost. |
| `CONFIG_VERSION_MISSING` | Mutation phụ thuộc config không gửi `configVersion`. |
| `CONFIG_VERSION_MISMATCH` | `configVersion` client không khớp active version trên server. |
| `BATTLE_EXPIRED` | Battle session đã quá hạn finish/claim reward. |
| `BATTLE_ALREADY_FINISHED` | Battle session đã được finish trước đó. |
| `IDEMPOTENCY_CONFLICT` | Cùng `idempotencyKey` nhưng payload khác request trước. |
| `INTERNAL_SERVER_ERROR` | Lỗi ngoài ý muốn trên server. |

## Operational Notes

- Access token TTL hiện tại: 15 phút
- Refresh token TTL hiện tại: 30 ngày
- `idempotencyKey` là bắt buộc cho hầu hết mutation có reward/claim/update profile
- `configVersion` là bắt buộc cho inventory mutation và battle start

## Documentation Pages

- Auth Docs: [/docs/auth](/docs/auth)
- Player Docs: [/docs/player](/docs/player)
- Character Docs: [/docs/character](/docs/character)
- Inventory Docs: [/docs/inventory](/docs/inventory)
- Formation Docs: [/docs/formation](/docs/formation)
- Lobby Docs: [/docs/lobby](/docs/lobby)
- Shop Docs: [/docs/shop](/docs/shop)
- Quest Docs: [/docs/quest](/docs/quest)
- Battle Docs: [/docs/battle](/docs/battle)
- Leaderboard Docs: [/docs/leaderboard](/docs/leaderboard)
- Config Docs: [/docs/config](/docs/config)

## External Reference

- Environment Config: [Google Sheet](https://docs.google.com/spreadsheets/d/1gPHUbUbTPOIgvykkxbRK4BGK1JGbZBNVgmBMmJw6ItI/edit?usp=sharing)

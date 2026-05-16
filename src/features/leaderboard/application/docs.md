# Leaderboard Docs

Tài liệu này mô tả các endpoint leaderboard và matchmaking.

- Base paths: `/api/v1/leaderboards`, `/api/v1/matchmaking`
- Protected routes: yêu cầu `Authorization: Bearer <accessToken>`
- Thành công dùng envelope `{ success, data, serverTime }`

## Routes

<details>
<summary><strong>Get Leaderboard - <code>GET /api/v1/leaderboards/:type</code></strong></summary>

**Mô tả route**

Trả về leaderboard theo loại `score`, `level`, hoặc `campaign`.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Path param:
- `type: score | level | campaign`

Query:
- `limit?: number` - được clamp về khoảng `1..100`

**Output Schema**

```json
{
  "success": true,
  "data": {
    "type": "score",
    "entries": [
      {
        "rank": 1,
        "playerId": "p_001",
        "displayName": "Top Player",
        "avatar": "avatar_01",
        "score": 1234
      }
    ]
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |

**Sample curl**

```bash
curl -X GET 'http://127.0.0.1:3000/api/v1/leaderboards/score?limit=20' \
  -H 'Authorization: Bearer <access-token>'
```

</details>

<details>
<summary><strong>Get My Rank - <code>GET /api/v1/leaderboards/:type/me</code></strong></summary>

**Mô tả route**

Trả về rank hiện tại của player đang đăng nhập trong leaderboard đã chọn.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Path param:
- `type: score | level | campaign`

**Output Schema**

```json
{
  "success": true,
  "data": {
    "type": "score",
    "rank": 12,
    "score": 255
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `NOT_FOUND` | Chưa có leaderboard projection cho player ở type đã chọn. |

**Sample curl**

```bash
curl -X GET 'http://127.0.0.1:3000/api/v1/leaderboards/score/me' \
  -H 'Authorization: Bearer <access-token>'
```

</details>

<details>
<summary><strong>Get Matchmaking Opponents - <code>GET /api/v1/matchmaking/opponents?mode=PVP</code></strong></summary>

**Mô tả route**

Trả về danh sách đối thủ matchmaking dựa trên leaderboard score hiện tại.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Query:
- `mode?: string` - hiện chỉ `PVP` trả về opponent; mode khác trả mảng rỗng

**Output Schema**

```json
{
  "success": true,
  "data": {
    "opponents": [
      {
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
        ],
        "units": [
          {
            "itemId": "Soldier",
            "level": 2,
            "evolveValue": 1
          }
        ]
      }
    ]
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |

**Sample curl**

```bash
curl -X GET 'http://127.0.0.1:3000/api/v1/matchmaking/opponents?mode=PVP' \
  -H 'Authorization: Bearer <access-token>'
```

</details>

## Quick Links

- API Portal: [/](/)
- Swagger Leaderboard: [/swagger/leaderboard](/swagger/leaderboard)
- Battle Docs: [/docs/battle](/docs/battle)

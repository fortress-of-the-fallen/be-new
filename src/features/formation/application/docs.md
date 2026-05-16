# Formation Docs

Tài liệu này mô tả đọc và thay thế active formation.

- Base path: `/api/v1/formation`
- Protected routes: yêu cầu `Authorization: Bearer <accessToken>`
- Thành công dùng envelope `{ success, data, serverTime }`

## Routes

<details>
<summary><strong>Get Formation - <code>GET /api/v1/formation</code></strong></summary>

**Mô tả route**

Trả về formation active hiện tại của player.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Không có body request.

**Output Schema**

```json
{
  "success": true,
  "data": {
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
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `NOT_FOUND` | Không tìm thấy formation active của player. |

**Sample curl**

```bash
curl -X GET 'http://127.0.0.1:3000/api/v1/formation' \
  -H 'Authorization: Bearer <access-token>'
```

</details>

<details>
<summary><strong>Replace Formation - <code>PUT /api/v1/formation</code></strong></summary>

**Mô tả route**

Thay thế toàn bộ formation theo `name` và `slots` được gửi lên.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

```json
{
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
        "x": 1,
        "y": 0,
        "z": 0
      }
    }
  ]
}
```

Ghi chú:
- `slots` bắt buộc từ 1 đến 5 phần tử
- `slot` không được trùng index
- `unitName` phải là hero player đang sở hữu

**Output Schema**

```json
{
  "success": true,
  "data": {
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
          "x": 1,
          "y": 0,
          "z": 0
        }
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
| `VALIDATION_FAILED` | Body sai schema, số slot ngoài giới hạn, hoặc có duplicate slot index. |
| `NOT_FOUND` | Một hoặc nhiều `unitName` không thuộc inventory hero của player. |

**Sample curl**

```bash
curl -X PUT 'http://127.0.0.1:3000/api/v1/formation' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "name": "active",
    "slots": [
      {
        "slot": 0,
        "unitName": "Soldier",
        "position": { "x": 0, "y": 0, "z": 0 }
      },
      {
        "slot": 1,
        "unitName": "Archer",
        "position": { "x": 1, "y": 0, "z": 0 }
      }
    ]
  }'
```

</details>

## Quick Links

- API Portal: [/](/)
- Swagger Formation: [/swagger/formation](/swagger/formation)
- Inventory Docs: [/docs/inventory](/docs/inventory)

# Config Docs

Tài liệu này mô tả các endpoint đọc config runtime.

- Base path: `/api/v1/configs`
- Authentication: không bắt buộc
- Thành công dùng envelope `{ success, data, serverTime }`

## Routes

<details>
<summary><strong>Get Manifest - <code>GET /api/v1/configs/manifest</code></strong></summary>

**Mô tả route**

Trả về active config version và map version theo từng config document.

**Authentication**

Không yêu cầu bearer token.

**Input Schema**

Không có body request.

**Output Schema**

```json
{
  "success": true,
  "data": {
    "activeVersion": "2026.05.02.1",
    "configs": {
      "hero": "2026.05.02.1",
      "quest": "2026.05.02.1",
      "rank": "2026.05.02.1",
      "campaign": "2026.05.02.1",
      "upgrade": "2026.05.02.1",
      "accountLevel": "2026.05.02.1",
      "lobby": "2026.05.02.1",
      "spriteResource": "2026.05.02.1"
    }
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `INTERNAL_SERVER_ERROR` | Lỗi ngoài ý muốn khi đọc manifest. |

**Sample curl**

```bash
curl -X GET 'http://127.0.0.1:3000/api/v1/configs/manifest'
```

</details>

<details>
<summary><strong>Get Config Document - <code>GET /api/v1/configs/:name?version=...</code></strong></summary>

**Mô tả route**

Trả về config document theo tên. Nếu không truyền `version`, server trả bản active của config đó.

**Authentication**

Không yêu cầu bearer token.

**Input Schema**

Path param:
- `name: string`

Query:
- `version?: string`

Tên config hiện có trong defaults:
- `hero`
- `quest`
- `rank`
- `campaign`
- `upgrade`
- `accountLevel`
- `lobby`
- `spriteResource`

**Output Schema**

```json
{
  "success": true,
  "data": {
    "name": "hero",
    "version": "2026.05.02.1",
    "records": [
      {
        "id": "Soldier",
        "itemClass": "Unit",
        "rarity": "normal",
        "shardCurrency": "normalShard"
      }
    ]
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `VALIDATION_FAILED` | `name` rỗng sau khi normalize. |
| `NOT_FOUND` | Không tìm thấy config active hoặc config theo `version` đã yêu cầu. |
| `INTERNAL_SERVER_ERROR` | Lỗi ngoài ý muốn khi đọc config document. |

**Sample curl**

```bash
curl -X GET 'http://127.0.0.1:3000/api/v1/configs/hero?version=2026.05.02.1'
```

</details>

## Quick Links

- API Portal: [/](/)
- Swagger Config: [/swagger/config](/swagger/config)
- Battle Docs: [/docs/battle](/docs/battle)
- Lobby Docs: [/docs/lobby](/docs/lobby)

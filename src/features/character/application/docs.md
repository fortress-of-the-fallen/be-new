# Character Feature Docs

Tài liệu chức năng quản lý nhân vật.

## Routes

<details>
<summary><strong>Create Character - <code>POST /v1/api/character</code></strong></summary>

Mô tả route: tạo nhân vật mới cho user hiện tại.

**Headers / Authentication**

- `session-id: string` (bắt buộc)

**Input Schema**

```json
{
  "character_name": "string",
  "gender": "male",
  "race": "human",
  "hair": "ShortWavy",
  "beard": "TrimGoatee",
  "eye": "RoundSharp",
  "hairColor": "#4A2C1D",
  "beardColor": "#2C1B12",
  "eyeColor": "#3A86FF"
}
```

**Output Schema (Success)**

```json
{
  "success": true,
  "errorCode": "",
  "result": "character-id-string"
}
```

**Error Messages**

| ErrorCode | Mô tả |
| --- | --- |
| `Character.Create.UserNotFound` | Không tìm thấy user từ `session-id`. |
| `Character.Create.MaxCharacterReached` | User đã đạt tối đa số nhân vật cho phép. |
| `Character.Create.CharacterNameExists` | Tên nhân vật đã tồn tại với user hiện tại. |
| `Character.Create.InvalidGender` | Giá trị `gender` không hợp lệ. |
| `Base.Message.ValidationError` | Request sai schema hoặc thiếu field bắt buộc. |

**Sample Request (curl)**

```bash
curl -X POST 'http://127.0.0.1:3000/v1/api/character' \
  -H 'content-type: application/json' \
  -H 'session-id: <session-id>' \
  -d '{
    "character_name": "hero_1",
    "gender": "male",
    "race": "human",
    "hair": "ShortWavy",
    "beard": "TrimGoatee",
    "eye": "RoundSharp",
    "hairColor": "#4A2C1D",
    "beardColor": "#2C1B12",
    "eyeColor": "#3A86FF"
  }'
```

</details>

<details>
<summary><strong>List Characters - <code>GET /v1/api/character</code></strong></summary>

Mô tả route: lấy danh sách nhân vật của user hiện tại.

**Headers / Authentication**

- `session-id: string` (bắt buộc)

**Input Schema**

Không có body request.

**Output Schema (Success)**

```json
{
  "success": true,
  "errorCode": "",
  "result": [
    {
      "_id": "character-id-string",
      "character_name": "hero_1",
      "race": "human",
      "gender": "male",
      "userId": "user-id-string",
      "appearance": {
        "_id": "appearance-id-string",
        "hair": "ShortWavy",
        "beard": "TrimGoatee",
        "eye": "RoundSharp",
        "hairColor": "#4A2C1D",
        "beardColor": "#2C1B12",
        "eyeColor": "#3A86FF"
      },
      "stats": {
        "_id": "stats-id-string",
        "str": 8,
        "dex": 8,
        "con": 8,
        "int": 8,
        "wis": 8,
        "cha": 8,
        "unspentPoints": 0,
        "hp": 112,
        "mp": 112,
        "patk": 40,
        "datk": 40,
        "matk": 40,
        "mdef": 32,
        "spd": 16,
        "crit": 8,
        "acc": 24,
        "eva": 24,
        "formulaVersion": 1
      }
    }
  ]
}
```

**Error Messages**

| ErrorCode | Mô tả |
| --- | --- |
| `Character.List.UserNotFound` | Không tìm thấy user từ `session-id`. |
| `Base.Message.Unauthorized` | Session không hợp lệ hoặc đã hết hạn. |

**Sample Request (curl)**

```bash
curl -X GET 'http://127.0.0.1:3000/v1/api/character' \
  -H 'session-id: <session-id>'
```

</details>

<details>
<summary><strong>Update Base Attributes - <code>PATCH /v1/api/character/:characterId/stats/base</code></strong></summary>

Mô tả route: cập nhật chỉ số cơ bản A của nhân vật và tự động tính lại chỉ số B.

**Headers / Authentication**

- `session-id: string` (bắt buộc)

**Input Schema**

- Path param:
  - `characterId: string` (bắt buộc)
- Body:

```json
{
  "str": 10,
  "dex": 8,
  "con": 9,
  "int": 8,
  "wis": 8,
  "cha": 8
}
```

Lưu ý:
- Body cho phép gửi một phần field.
- Mỗi field phải là số nguyên không âm.
- Tổng điểm tăng thêm không được vượt `unspentPoints`.

**Output Schema (Success)**

```json
{
  "success": true,
  "errorCode": "",
  "result": {
    "_id": "stats-id-string",
    "str": 10,
    "dex": 8,
    "con": 9,
    "int": 8,
    "wis": 8,
    "cha": 8,
    "unspentPoints": 0,
    "hp": 128,
    "mp": 112,
    "patk": 47,
    "datk": 45,
    "matk": 40,
    "mdef": 32,
    "spd": 16,
    "crit": 8,
    "acc": 24,
    "eva": 25,
    "formulaVersion": 1
  }
}
```

**Error Messages**

| ErrorCode | Mô tả |
| --- | --- |
| `Character.UpdateBaseAttributes.CharacterIdRequired` | Thiếu `characterId` trong URL. |
| `Character.UpdateBaseAttributes.UserNotFound` | Không tìm thấy user từ `session-id`. |
| `Character.UpdateBaseAttributes.CharacterNotFound` | Character không tồn tại, đã bị xóa, hoặc không thuộc user hiện tại. |
| `Character.UpdateBaseAttributes.StatsNotFound` | Character chưa có bản ghi stats (cần backfill dữ liệu cũ). |
| `Character.UpdateBaseAttributes.NoAttributeToUpdate` | Body không có bất kỳ field chỉ số nào để cập nhật. |
| `Character.UpdateBaseAttributes.InvalidAttributeValue` | Có field chỉ số âm hoặc không hợp lệ. |
| `Character.UpdateBaseAttributes.InsufficientUnspentPoints` | Không đủ `unspentPoints` để tăng tổng điểm base. |
| `Base.Message.ValidationError` | Request sai schema (ví dụ truyền sai kiểu dữ liệu). |

**Sample Request (curl)**

```bash
curl -X PATCH 'http://127.0.0.1:3000/v1/api/character/<character-id>/stats/base' \
  -H 'content-type: application/json' \
  -H 'session-id: <session-id>' \
  -d '{
    "str": 10,
    "con": 9
  }'
```

</details>

<details>
<summary><strong>Delete Character - <code>DELETE /v1/api/character/:characterId</code></strong></summary>

Mô tả route: xóa mềm (soft delete) nhân vật của user hiện tại.

**Headers / Authentication**

- `session-id: string` (bắt buộc)

**Input Schema**

- Path param:
  - `characterId: string` (bắt buộc)

**Output Schema (Success)**

```json
{
  "success": true,
  "errorCode": "",
  "error": "",
  "timestamp": "2026-02-25T00:00:00.000Z"
}
```

**Error Messages**

| ErrorCode | Mô tả |
| --- | --- |
| `Character.Delete.CharacterIdRequired` | Thiếu `characterId` trong URL. |
| `Character.Delete.UserNotFound` | Không tìm thấy user từ `session-id`. |
| `Character.Delete.CharacterNotFound` | Character không tồn tại, đã bị xóa, hoặc không thuộc user hiện tại. |
| `Base.Message.Unauthorized` | Session không hợp lệ hoặc đã hết hạn. |

**Sample Request (curl)**

```bash
curl -X DELETE 'http://127.0.0.1:3000/v1/api/character/<character-id>' \
  -H 'session-id: <session-id>'
```

</details>

## Quick Links

- Character Docs Page: [/docs/character](/docs/character)
- Swagger Character (API Call): [/swagger/character](/swagger/character)
- API Portal: [/](/)
- Auth Docs: [/docs/auth](/docs/auth)

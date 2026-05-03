# Character Docs

Tài liệu này mô tả implementation hiện tại của feature `character`.

- Base path: `/api/v1/character`
- Protected routes: yêu cầu `Authorization: Bearer <accessToken>`
- Compatibility note: success response của feature này vẫn dùng envelope cũ `result/errorCode/timestamp`
- Auth/guard errors vẫn dùng envelope lỗi mới `{ success, error, serverTime }`

## Success Envelope Compatibility

**Result response**

```json
{
  "success": true,
  "errorCode": "",
  "error": "",
  "timestamp": "2026-05-04T10:00:00.000Z",
  "result": {}
}
```

**Execution response**

```json
{
  "success": true,
  "errorCode": "",
  "error": "",
  "timestamp": "2026-05-04T10:00:00.000Z"
}
```

## Routes

<details>
<summary><strong>Create Character - <code>POST /api/v1/character</code></strong></summary>

**Mô tả route**

Tạo character mới cho account hiện tại, đồng thời sinh appearance và stats mặc định.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

```json
{
  "character_name": "MyCharacter",
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

**Output Schema**

```json
{
  "success": true,
  "errorCode": "",
  "error": "",
  "timestamp": "2026-05-04T10:00:00.000Z",
  "result": "character-id-string"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `Character.Create.UserNotFound` | Token hợp lệ nhưng không resolve được user active. |
| `Character.Create.MaxCharacterReached` | Đã đạt giới hạn character slot của account. |
| `Character.Create.CharacterNameExists` | `character_name` đã tồn tại trong account hiện tại. |
| `VALIDATION_FAILED` | Body sai schema, `gender` không hợp lệ, hoặc mã màu HEX không đúng. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/character' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "character_name": "MyCharacter",
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
<summary><strong>List Characters - <code>GET /api/v1/character</code></strong></summary>

**Mô tả route**

Trả về toàn bộ character chưa bị xóa mềm của user hiện tại, kèm appearance và stats.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Không có body request.

**Output Schema**

```json
{
  "success": true,
  "errorCode": "",
  "error": "",
  "timestamp": "2026-05-04T10:00:00.000Z",
  "result": [
    {
      "_id": "character-id-string",
      "character_name": "MyCharacter",
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

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `Character.List.UserNotFound` | Token hợp lệ nhưng không resolve được user active. |

**Sample curl**

```bash
curl -X GET 'http://127.0.0.1:3000/api/v1/character' \
  -H 'Authorization: Bearer <access-token>'
```

</details>

<details>
<summary><strong>Update Base Attributes - <code>PATCH /api/v1/character/:characterId/stats/base</code></strong></summary>

**Mô tả route**

Cập nhật base attributes cho character, sau đó server tự tính lại toàn bộ derived stats.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Path param:
- `characterId: string`

Body:

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

Ghi chú:
- Có thể gửi partial body
- Mỗi field phải là số nguyên không âm
- Tổng điểm tăng thêm không được vượt `unspentPoints`

**Output Schema**

```json
{
  "success": true,
  "errorCode": "",
  "error": "",
  "timestamp": "2026-05-04T10:00:00.000Z",
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

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `Character.UpdateBaseAttributes.CharacterIdRequired` | Thiếu `characterId` trong URL. |
| `Character.UpdateBaseAttributes.UserNotFound` | Token hợp lệ nhưng không resolve được user active. |
| `Character.UpdateBaseAttributes.CharacterNotFound` | Character không tồn tại, đã xóa, hoặc không thuộc user hiện tại. |
| `Character.UpdateBaseAttributes.StatsNotFound` | Character chưa có stats record. |
| `Character.UpdateBaseAttributes.NoAttributeToUpdate` | Body không có field nào để cập nhật. |
| `Character.UpdateBaseAttributes.InvalidAttributeValue` | Có attribute âm hoặc không hợp lệ. |
| `Character.UpdateBaseAttributes.InsufficientUnspentPoints` | Không đủ `unspentPoints` để tăng tổng điểm base. |
| `VALIDATION_FAILED` | Body sai kiểu dữ liệu. |

**Sample curl**

```bash
curl -X PATCH 'http://127.0.0.1:3000/api/v1/character/<character-id>/stats/base' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "str": 10,
    "con": 9
  }'
```

</details>

<details>
<summary><strong>Delete Character - <code>DELETE /api/v1/character/:characterId</code></strong></summary>

**Mô tả route**

Xóa mềm character hiện tại bằng cách set `isDeleted = true`.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Path param:
- `characterId: string`

Không có body request.

**Output Schema**

```json
{
  "success": true,
  "errorCode": "",
  "error": "",
  "timestamp": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `Character.Delete.CharacterIdRequired` | Thiếu `characterId` trong URL. |
| `Character.Delete.UserNotFound` | Token hợp lệ nhưng không resolve được user active. |
| `Character.Delete.CharacterNotFound` | Character không tồn tại, đã xóa, hoặc không thuộc user hiện tại. |

**Sample curl**

```bash
curl -X DELETE 'http://127.0.0.1:3000/api/v1/character/<character-id>' \
  -H 'Authorization: Bearer <access-token>'
```

</details>

## Quick Links

- API Portal: [/](/)
- Swagger Character: [/swagger/character](/swagger/character)
- Auth Docs: [/docs/auth](/docs/auth)
- Player Docs: [/docs/player](/docs/player)

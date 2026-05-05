# Auth Docs

Tài liệu này bám implementation hiện tại của backend xác thực.

- Base path: `/api/v1/auth`
- Content type: `application/json`
- Access token: bearer token 15 phút
- Refresh token: server-stored token 30 ngày, được rotate ở `refresh`

## Response Envelope

**Success**

```json
{
  "success": true,
  "data": {},
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error**

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

## Routes

<details>
<summary><strong>Register - <code>POST /api/v1/auth/register</code></strong></summary>

**Mô tả route**

Tạo account mới, bootstrap player mặc định, rồi trả về cặp `accessToken` và `refreshToken`.

**Authentication**

Không yêu cầu bearer token.

**Input Schema**

```json
{
  "username": "player01",
  "password": "secret123",
  "confirmPassword": "secret123",
  "displayName": "Player01"
}
```

Ghi chú:
- `username`: 3-32 ký tự
- `password`: 8-64 ký tự
- `confirmPassword`: optional; nếu có thì phải khớp `password`
- `displayName`: optional; 1-32 ký tự

**Output Schema**

```json
{
  "success": true,
  "data": {
    "accessToken": "<access-token>",
    "refreshToken": "<refresh-token>",
    "player": {
      "playerId": "p_abc123",
      "username": "player01",
      "displayName": "Player01"
    }
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `VALIDATION_FAILED` | Body sai schema, thiếu field bắt buộc, hoặc `confirmPassword` không khớp `password`. |
| `USERNAME_TAKEN` | `username` đã tồn tại. |
| `INTERNAL_SERVER_ERROR` | Lỗi ngoài ý muốn khi tạo account hoặc bootstrap player. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/auth/register' \
  -H 'content-type: application/json' \
  -d '{
    "username": "player01",
    "password": "secret123",
    "confirmPassword": "secret123",
    "displayName": "Player01"
  }'
```

</details>

<details>
<summary><strong>Login - <code>POST /api/v1/auth/login</code></strong></summary>

**Mô tả route**

Xác thực account hiện có và tạo session refresh mới cho thiết bị hiện tại. Backend không còn chặn số lượng session đăng nhập đồng thời.

**Authentication**

Không yêu cầu bearer token.

**Input Schema**

```json
{
  "username": "player01",
  "password": "secret123",
  "rememberMe": true,
  "connectionId": "socket-connection-id"
}
```

Ghi chú:
- `rememberMe`: optional; hiện được accept ở API layer nhưng không đổi TTL refresh token
- `connectionId`: optional; hiện chỉ được accept, không phải field bắt buộc

**Output Schema**

```json
{
  "success": true,
  "data": {
    "accessToken": "<access-token>",
    "refreshToken": "<refresh-token>",
    "player": {
      "playerId": "p_abc123",
      "username": "player01",
      "displayName": "Player01"
    }
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `VALIDATION_FAILED` | Body sai schema hoặc thiếu field bắt buộc. |
| `INVALID_CREDENTIALS` | `username` không tồn tại, user không active, hoặc mật khẩu sai. |
| `INTERNAL_SERVER_ERROR` | Lỗi ngoài ý muốn khi tạo session mới. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/auth/login' \
  -H 'content-type: application/json' \
  -d '{
    "username": "player01",
    "password": "secret123"
  }'
```

</details>

<details>
<summary><strong>Refresh - <code>POST /api/v1/auth/refresh</code></strong></summary>

**Mô tả route**

Dùng `refreshToken` hiện tại để rotate session và lấy cặp token mới.

**Authentication**

Không yêu cầu bearer token.

**Input Schema**

```json
{
  "refreshToken": "<refresh-token>"
}
```

**Output Schema**

```json
{
  "success": true,
  "data": {
    "accessToken": "<new-access-token>",
    "refreshToken": "<new-refresh-token>"
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `VALIDATION_FAILED` | Thiếu `refreshToken` hoặc body sai schema. |
| `UNAUTHORIZED` | `refreshToken` không hợp lệ, đã hết hạn, đã revoke, hoặc account không còn active. |
| `INTERNAL_SERVER_ERROR` | Lỗi ngoài ý muốn khi rotate session. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/auth/refresh' \
  -H 'content-type: application/json' \
  -d '{
    "refreshToken": "<refresh-token>"
  }'
```

</details>

<details>
<summary><strong>Logout - <code>POST /api/v1/auth/logout</code></strong></summary>

**Mô tả route**

Revoke đúng refresh session đang gắn với bearer token hiện tại.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

```json
{
  "refreshToken": "<refresh-token>"
}
```

**Output Schema**

```json
{
  "success": true,
  "data": {
    "revoked": true
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token, access token hết hạn/không hợp lệ, hoặc `refreshToken` không thuộc session hiện tại. |
| `VALIDATION_FAILED` | Thiếu `refreshToken` hoặc body sai schema. |
| `FORBIDDEN` | Bearer token hợp lệ nhưng role không phù hợp. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/auth/logout' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "refreshToken": "<refresh-token>"
  }'
```

</details>

## Quick Links

- API Portal: [/](/)
- Swagger Auth: [/swagger/auth](/swagger/auth)
- Player Docs: [/docs/player](/docs/player)
- Inventory Docs: [/docs/inventory](/docs/inventory)

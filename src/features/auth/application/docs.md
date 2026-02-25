# Auth Feature Docs

Tài liệu chức năng xác thực người dùng.

## Routes

### Register - `POST /v1/auth/register`

Mô tả: tạo tài khoản mới và trả về `session-id`.

**Input Schema**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Output Schema (Success)**

```json
{
  "success": true,
  "errorCode": "",
  "result": "session-id-string"
}
```

**Error Messages**

| ErrorCode | Mô tả |
| --- | --- |
| `Auth.Register.PasswordMismatch` | `password` và `confirmPassword` không khớp nhau. |
| `Auth.Register.UsernameExists` | Username đã tồn tại. |
| `Auth.Register.EmailExists` | Email đã được sử dụng. |
| `Base.Message.ValidationError` | Request sai schema hoặc thiếu field bắt buộc. |

### Login - `POST /v1/auth/login`

Mô tả: đăng nhập và trả về `session-id` mới.

**Input Schema**

```json
{
  "username": "string",
  "password": "string",
  "rememberMe": true,
  "connectionId": "string"
}
```

**Output Schema (Success)**

```json
{
  "success": true,
  "errorCode": "",
  "result": "session-id-string"
}
```

**Error Messages**

| ErrorCode | Mô tả |
| --- | --- |
| `Auth.Login.UserNotFound` | Không tìm thấy user theo thông tin đăng nhập. |
| `Auth.Login.InvalidCredentials` | Sai mật khẩu hoặc thông tin đăng nhập không hợp lệ. |
| `Auth.Login.MaxSessionReached` | Đạt giới hạn số session đăng nhập đồng thời. |
| `Auth.Login.ClientNotConnected` | Client broadcast chưa kết nối. |
| `Base.Message.ValidationError` | Request sai schema hoặc thiếu field bắt buộc. |

### Logout - `DELETE /v1/auth/logout`

Mô tả: đăng xuất và thu hồi session hiện tại.

**Headers**

- `session-id: string` (bắt buộc)

**Output Schema (Success)**

```json
{
  "success": true,
  "errorCode": ""
}
```

**Error Messages**

| ErrorCode | Mô tả |
| --- | --- |
| `Auth.Logout.SessionIdRequired` | Thiếu header `session-id`. |
| `Auth.Logout.UserNotFound` | Không tìm thấy user tương ứng session hiện tại. |
| `Auth.Logout.SessionNotFound` | Session không tồn tại hoặc đã bị thu hồi. |
| `Base.Message.Unauthorized` | Session không hợp lệ hoặc đã hết hạn. |

## Quick Links

- Auth Docs Page: [/docs/auth](/docs/auth)
- Swagger Auth (API Call): [/swagger/auth](/swagger/auth)
- API Portal: [/](/)
- Character Docs: [/docs/character](/docs/character)

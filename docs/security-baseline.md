# Security Baseline Review cho Backend API

> Tài liệu mức báo cáo/demo để rà soát bề mặt security cơ bản của backend.  
> Mục tiêu là chứng minh hệ thống có lớp phòng thủ nền tảng trước các câu hỏi về auth, validation, error handling và abuse control.  
> Đây **không phải** pentest chuyên sâu hay cloud hardening checklist.

## 1. Mục tiêu

Tài liệu này dùng để chốt các điểm tối thiểu cần có khi trình bày backend API:

- endpoint nhạy cảm phải có auth guard phù hợp
- input quan trọng phải được validate
- lỗi trả ra không làm lộ thông tin nội bộ
- action dễ double-submit phải có idempotency hoặc guard tương đương
- có lớp giảm abuse cơ bản như rate limit / throttling nếu đã hỗ trợ
- secrets/config không bị lộ trong docs, example files, logs

## 2. Phạm vi

### In scope

- JWT / auth checks
- phân loại endpoint public vs private
- validation cho body / query / headers quan trọng
- error envelope cho `400 / 401 / 403 / 409`
- idempotency cho request lặp lại
- rate limit / throttling mức cơ bản
- review secrets/config exposure trong code và docs

### Out of scope

- pentest chuyên sâu
- SAST/DAST diện rộng
- hardening hạ tầng production
- WAF / DDoS / secret rotation ở mức enterprise

## 3. Security baseline cần đạt

```text
Client request
  → Auth check
    → Public route: đi tiếp không cần token
    → Private route: bắt buộc token hợp lệ
  → Validation check
    → body/query/header sai: trả 400 rõ ràng, không lộ stack trace
  → Business guard
    → forbidden case: trả 403
    → duplicate submit: trả reused response hoặc 409 conflict
  → Abuse control
    → rate limit / throttling nếu có
  → Response
    → envelope thống nhất, không lộ thông tin nội bộ
```

## 4. Checklist rà soát

## 4.1. Public vs private endpoints

Cần có bảng phân loại rõ:

| Nhóm endpoint | Kỳ vọng |
| --- | --- |
| `POST /auth/register` | Public |
| `POST /auth/login` | Public |
| `POST /auth/refresh` | Public hoặc có cơ chế refresh token riêng |
| `GET /configs/*` | Public nếu là runtime config an toàn |
| `/me`, `/inventory/*`, `/quests/*`, `/battle/*`, admin routes | Private |

Câu hỏi cần trả lời được:
- endpoint nào mở public có chủ đích?
- endpoint nào bắt buộc bearer token?
- có route nhạy cảm nào vô tình thiếu guard không?

## 4.2. JWT / auth guard

Checklist:

- token thiếu hoặc sai format → `401 Unauthorized`
- token hết hạn / không hợp lệ → `401 Unauthorized`
- token hợp lệ nhưng không đủ quyền → `403 Forbidden`
- logout / revoke token phải làm token cũ mất hiệu lực theo thiết kế hệ thống
- refresh token phải có vòng đời và quy tắc rotate/revoke rõ ràng

## 4.3. Validation

Cần kiểm tra các input sau:

- field bắt buộc bị thiếu
- field sai kiểu dữ liệu
- string quá ngắn / quá dài
- number âm / vượt range
- enum không hợp lệ
- header quan trọng bị thiếu
- query param không hợp lệ

Kỳ vọng:
- trả `400 Bad Request`
- thông báo đủ rõ để client sửa request
- không lộ stack trace / SQL / internal exception message

## 4.4. Error handling

Kỳ vọng tối thiểu:

- response có shape ổn định
- có `code` hoặc `message` dễ hiểu cho client
- không trả raw exception từ framework/library
- không lộ path nội bộ, stack trace, connection string, secret names

## 4.5. Idempotency / duplicate submit

Các action mutate state cần cân nhắc:

- claim reward
- purchase / upgrade / evolve
- finish battle
- update profile / rename nếu có side effect tài nguyên

Cần trả lời được:
- cùng `idempotency key` + cùng payload → hệ thống reuse kết quả hay từ chối?
- cùng `idempotency key` + khác payload → trả `409 Conflict` hay lỗi guard tương đương?
- nếu chưa có idempotency đầy đủ, endpoint nào có nguy cơ double-submit?

## 4.6. Rate limit / abuse control

Nếu backend có throttling/rate limit, cần chỉ ra:

- route nào đang áp dụng
- khi vượt ngưỡng trả gì (`429 Too Many Requests`)
- có ưu tiên bật cho login / refresh / public endpoints dễ bị spam hay không

Nếu chưa có, cần ghi rõ đây là backlog bảo mật tiếp theo.

## 4.7. Secret / config exposure

Checklist:

- docs không chứa secret thật
- `.env.example` chỉ chứa placeholder hoặc `[REDACTED]`
- logs không in token đầy đủ / password / SMTP secret / DB password
- response không lộ internal config names ngoài nhu cầu client
- swagger/docs không copy credential thật vào ví dụ request

## 5. Response mẫu nên có khi demo

## 5.1. `400 Bad Request`

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Payload không hợp lệ",
    "details": {
      "field": "username",
      "reason": "must be at least 3 characters"
    }
  },
  "serverTime": "2026-05-16T00:00:00.000Z"
}
```

## 5.2. `401 Unauthorized`

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token không hợp lệ hoặc đã hết hạn"
  },
  "serverTime": "2026-05-16T00:00:00.000Z"
}
```

## 5.3. `403 Forbidden`

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Bạn không có quyền thực hiện thao tác này"
  },
  "serverTime": "2026-05-16T00:00:00.000Z"
}
```

## 5.4. `409 Conflict`

```json
{
  "success": false,
  "error": {
    "code": "IDEMPOTENCY_CONFLICT",
    "message": "Request bị trùng idempotency key nhưng payload khác"
  },
  "serverTime": "2026-05-16T00:00:00.000Z"
}
```

## 6. Demo script rà nhanh trước khi báo cáo

```text
1. Chọn 1 endpoint public
   → gọi không token
   → kỳ vọng 200 hoặc success hợp lệ

2. Chọn 1 endpoint private
   → gọi không token
   → kỳ vọng 401

3. Gọi lại endpoint private với token sai/hết hạn
   → kỳ vọng 401

4. Gửi payload sai kiểu hoặc thiếu field
   → kỳ vọng 400

5. Thử case không đủ quyền
   → kỳ vọng 403

6. Thử gửi 2 request mutation với cùng idempotency key
   → quan sát reused response hoặc 409 conflict

7. Kiểm tra docs / env example / logs
   → không có secret thật, không có stack trace lộ ra ngoài client
```

## 7. Cách trả lời khi bị hỏi phản biện

### Backend đã làm gì để giảm request lỗi và abuse cơ bản?

```text
Backend có lớp phòng thủ theo nhiều tầng:
- tầng 1 là auth guard để chặn request không có token hoặc token sai
- tầng 2 là validation để chặn payload lỗi ngay từ biên request
- tầng 3 là business guard để xử lý forbidden và conflict rõ ràng
- tầng 4 là idempotency hoặc cơ chế tương đương để tránh double-submit ở các action mutate state
- ngoài ra có thể bật rate limit cho các public endpoint dễ bị spam như login/refresh
```

### Nếu token sai hoặc hết hạn thì hệ thống phản ứng thế nào?

```text
Request sẽ bị chặn ở auth layer và trả 401 Unauthorized với message đã được sanitize, không lộ chi tiết nội bộ của JWT library hay stack trace.
```

### Nếu client gửi payload sai thì sao?

```text
Backend trả 400 Bad Request với message đủ rõ để client sửa request, ví dụ field nào sai hoặc thiếu, nhưng không trả exception raw từ framework.
```

### Nếu user bấm nhiều lần cùng một action thì sao?

```text
Các action nhạy cảm nên có idempotency key hoặc guard tương đương để tránh tạo side effect trùng lặp. Nếu cùng key nhưng khác payload thì nên trả conflict thay vì thực hiện bừa.
```

## 8. Kết luận / tiêu chí Done cho issue này

Issue #9 được xem là đạt khi đã có artifact đủ để dùng trong báo cáo và review:

- có checklist security cơ bản
- có ma trận public/private route ở mức nguyên tắc
- có ví dụ response cho `401 / 403 / 400 / 409`
- có script rà nhanh trước khi demo
- có mẫu trả lời câu hỏi phản biện về auth, validation, error handling và abuse control

## 9. Ghi chú triển khai

Vì nhánh `main` hiện chưa chứa source backend hoàn chỉnh, tài liệu này đóng vai trò **security baseline / review checklist** để áp vào nhánh triển khai backend khi code sẵn sàng.

Khi backend code đã có trên nhánh làm việc chính, bước tiếp theo nên là:

1. map checklist này vào từng controller thực tế
2. ghi lại endpoint nào đã pass / chưa pass
3. bổ sung evidence cụ thể từ response thật hoặc test case thật
4. mở issue follow-up cho các lỗ hổng còn thiếu như throttling, secret hygiene, logging sanitization

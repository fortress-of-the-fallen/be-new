# Kế Hoạch Refactor Sang DDD Cho Feature Auth

## Phạm vi

Refactor feature `auth` sang Domain-Driven Design và migrate truy cập dữ liệu sang Prisma (MongoDB).

## Mục tiêu

- Đưa toàn bộ logic nghiệp vụ xác thực vào domain model của `auth`.
- Giảm lớp trung gian không cần thiết để tăng tốc phát triển.
- Giữ nguyên hành vi API hiện tại (không breaking change contract).
- Đảm bảo rule nghiệp vụ khớp với `game-design-docs/` (nếu có liên quan).
- Chuẩn hóa persistence của `auth` bằng Prisma, không dùng Mongoose cho luồng đã migrate.

## Cấu trúc DDD đề xuất cho auth

- `src/auth/domain/`
  - aggregate/entity/value-object
  - domain service
  - repository contract
  - domain event
- `src/auth/application/`
  - command/query + handler
  - app service orchestration
- `src/auth/presentation/`
  - controller
  - dto request/response
- `src/auth/persistence-prisma/`
  - prisma service/client
  - repository adapter dùng Prisma để implement contract ở domain
  - mapper domain <-> persistence model

## Lộ trình triển khai

## Giai đoạn 1: Chốt domain model auth

- Xác định aggregate root chính (ví dụ: `AuthAccount` hoặc `Credential`).
- Gom các invariant:
  - kiểm tra trạng thái tài khoản
  - quy tắc xác thực mật khẩu/token
  - lock/unlock logic (nếu có)
- Tạo Value Object cho dữ liệu có luật riêng:
  - email/username
  - password hash
  - refresh token id

**Đầu ra:** domain model + unit test cho rule lõi.

## Giai đoạn 2: Dựng nền Prisma cho auth

- Cài và cấu hình:
  - `prisma`
  - `@prisma/client`
- Tạo/cập nhật `schema.prisma` với `provider = "mongodb"` cho phạm vi `auth`.
- Chuẩn hóa mapping `_id` (ObjectId <-> string), timestamp, enum và field soft-delete/lock liên quan auth.
- Dùng `prisma db push` để đồng bộ schema.
- Tạo `PrismaModule`/Prisma service với lifecycle hook phù hợp NestJS.

**Đầu ra:** auth có nền persistence bằng Prisma chạy được trên môi trường local/test.

## Giai đoạn 3: Refactor application layer auth

- Tách các use-case chính thành application service rõ ràng:
  - đăng nhập
  - refresh token
  - đăng xuất
  - đổi mật khẩu (nếu có)
- Application service chỉ orchestration, không chứa business rule lõi.

**Đầu ra:** use-case mỏng, dễ đọc, dễ test.

## Giai đoạn 4: Migrate repository auth sang Prisma

- Giữ repository contract ở `domain`.
- Implement repository adapter bằng Prisma cho:
  - tìm tài khoản đăng nhập
  - lưu/rotate refresh token
  - revoke token / logout
- Loại bỏ wiring Mongoose trong luồng `auth` đã migrate.
- Đảm bảo tương thích dữ liệu cũ bằng kiểm tra parity trên các collection auth.

**Đầu ra:** luồng truy cập dữ liệu `auth` chạy Prisma, không đổi contract nghiệp vụ.

## Giai đoạn 5: Tích hợp event và hardening

- Phát domain event cho các hành vi chính:
  - đăng nhập thành công
  - refresh token
  - đăng xuất
- Bổ sung idempotency tại handler quan trọng (nếu có xử lý bất đồng bộ).
- Tăng logging/correlation id cho auth flow.
- Kiểm tra index quan trọng cho auth trên Mongo (ví dụ: unique email/username, TTL nếu có session/token phụ thuộc auth).

**Đầu ra:** auth flow ổn định, dễ theo dõi lỗi.

## Giai đoạn 6: Rollout và dọn dẹp

- Chạy smoke test trên staging với snapshot dữ liệu gần production.
- Rollout theo canary cho luồng auth dùng Prisma.
- Chuẩn bị rollback plan rõ ràng về luồng Mongoose trong thời gian giám sát sau rollout.
- Sau khi ổn định, gỡ phần Mongoose không còn dùng trong `auth`.

**Đầu ra:** `auth` cutover sang Prisma an toàn, có runbook vận hành.

## Kiểm thử bắt buộc

- Unit test: aggregate/value object/domain service của `auth`.
- Integration test: repository adapter Prisma của `auth`.
- API regression test: toàn bộ endpoint `auth`.
- Smoke test staging trước rollout.

## Definition of Done

- Feature `auth` có cấu trúc DDD gọn theo domain + application + presentation trong phạm vi context auth.
- Logic nghiệp vụ xác thực nằm trong domain, không còn rải ở controller.
- Luồng truy cập dữ liệu `auth` dùng Prisma và đã bỏ Mongoose ở phần đã migrate.
- Test unit + integration + regression của `auth` đều pass.
- Không còn thêm logic mới vào luồng auth legacy.

## Kế hoạch ngắn 2 tuần

1. Tuần 1: chốt domain model + dựng Prisma nền + migrate đăng nhập.
2. Tuần 2: migrate refresh/logout + hardening + test/regression + canary rollout.

## Bước tiếp theo ngay

- Tạo PR đầu tiên: dựng skeleton DDD cho `auth`, tích hợp Prisma Mongo, migrate use-case `đăng nhập`.

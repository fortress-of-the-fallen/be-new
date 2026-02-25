# Kế hoạch triển khai Bot CLI Telegram

## 1) Mục tiêu
- Tạo thư mục gốc `bot/` (tách biệt khỏi `src/` hiện tại).
- Bên trong `bot/` có ứng dụng CLI, chạy bằng lệnh `npm run bot`.
- Hỗ trợ 3 lệnh ban đầu:
- `add-telegram-token`: thêm/cập nhật Telegram Bot Token.
- `remove-current-webhook`: gỡ webhook hiện tại của bot Telegram.
- `get-recent-chat-id`: lấy danh sách chat gần đây (ưu tiên chat id mới nhất).
- Dữ liệu cấu hình lưu vào file JSON trong `bot/`.
- Tổ chức mã theo `command pattern` và `feature-based`.
- Ưu tiên dùng thư viện phổ biến, hạn chế “code chay”.

## 2) Phạm vi kỹ thuật
- Chỉ triển khai CLI trong `bot/`, chưa tích hợp sâu vào runtime NestJS.
- Dùng Node.js + TypeScript (đồng bộ với hệ thống hiện tại).
- Dùng chung `package.json` gốc của dự án (không tạo package riêng trong `bot/`).
- Không thay đổi logic domain game hiện có.

## 3) Đề xuất thư viện
- CLI framework: `commander`.
- Prompt tương tác: `@inquirer/prompts` (hoặc `inquirer`).
- Telegram API client: `grammy` (có thể thay bằng `node-telegram-bot-api` nếu cần long polling sẵn).
- Đọc/ghi file JSON: `lowdb` hoặc `conf` (ưu tiên `conf` nếu muốn quản lý cấu hình đơn giản theo key).
- Logging: `pino` hoặc `consola`.
- Validation: `zod`.
- Env/path tiện ích: `dotenv`, `pathe` hoặc `node:path`.

## 4) Cấu trúc thư mục đề xuất (feature-based + command pattern)
```text
bot/
  data/
    bot-config.json
  src/
    cli.ts
    shared/
      config/
        config.repository.ts
        config.schema.ts
      telegram/
        telegram.client.ts
    features/
      telegram-token/
        commands/
          add-telegram-token.command.ts
          add-telegram-token.handler.ts
      webhook/
        commands/
          remove-current-webhook.command.ts
          remove-current-webhook.handler.ts
      chat/
        commands/
          get-recent-chat-id.command.ts
          get-recent-chat-id.handler.ts
```

## 5) Thiết kế command pattern
- Mỗi thao tác CLI ánh xạ 1 `Command` (DTO dữ liệu đầu vào) + 1 `Handler`.
- `cli.ts` chỉ làm nhiệm vụ parse args và gọi đúng handler.
- Các handler không thao tác trực tiếp với CLI UI; thay vào đó gọi service/repository.
- Tầng `shared` chứa:
- Telegram client wrapper (khởi tạo từ token).
- Config repository (đọc/ghi JSON).
- Validation schema.

## 6) Luồng cho từng lệnh
- `add-telegram-token`
- Nhập token qua tham số (`--token`) hoặc prompt.
- Validate format cơ bản (không rỗng, đúng pattern token Telegram).
- Gọi `getMe` để kiểm tra token hợp lệ.
- Lưu token vào `bot/data/bot-config.json`.

- `remove-current-webhook`
- Đọc token từ config JSON.
- Nếu chưa có token: báo lỗi có hướng dẫn chạy `add-telegram-token`.
- Gọi API Telegram xóa webhook (`deleteWebhook`).
- In kết quả thành công/thất bại.

- `get-recent-chat-id`
- Đọc token từ config JSON.
- Dùng `getUpdates` để lấy update gần đây.
- Trích xuất `chat.id`, loại bỏ trùng, sắp theo thời gian mới nhất.
- In danh sách chat id + metadata cơ bản (type, title/username nếu có).

## 7) Kế hoạch triển khai theo bước
1. Khởi tạo khung `bot/` và entrypoint CLI.
2. Cấu hình script `npm run bot` từ `package.json` gốc.
3. Cài thư viện và wiring TypeScript build/run cho CLI.
4. Tạo tầng `shared`:
5. JSON config repository + schema validate.
6. Telegram client wrapper.
7. Triển khai feature `telegram-token` (add token).
8. Triển khai feature `webhook` (remove webhook).
9. Triển khai feature `chat` (get recent chat id).
10. Thêm xử lý lỗi chuẩn + logging thống nhất.
11. Viết README ngắn cho cách dùng CLI.
12. Chạy kiểm thử thủ công end-to-end bằng lệnh CLI.

## 8) Định nghĩa hoàn thành (Definition of Done)
- Chạy `npm run bot -- --help` hiển thị đầy đủ lệnh.
- `add-telegram-token` lưu JSON thành công và token dùng được.
- `remove-current-webhook` xóa webhook thành công với token hợp lệ.
- `get-recent-chat-id` trả danh sách chat id gần đây, có xử lý khi không có update.
- Mã nguồn tách theo feature + command/handler, không dồn logic vào `cli.ts`.
- Có tài liệu sử dụng nhanh và ví dụ lệnh.

## 9) Rủi ro và phương án xử lý
- `getUpdates` có thể rỗng nếu bot chưa từng nhận tin nhắn.
- Giải pháp: in hướng dẫn “hãy nhắn tin cho bot trước rồi chạy lại”.
- Trùng xung đột giữa webhook và polling/update.
- Giải pháp: luôn cho phép chạy `remove-current-webhook` trước khi `get-recent-chat-id`.
- Lưu token plain text trong JSON.
- Giải pháp trước mắt: chấp nhận theo yêu cầu; giai đoạn sau có thể mã hóa hoặc chuyển secret manager.

## 10) Gợi ý lệnh sử dụng sau khi hoàn tất
```bash
npm run bot -- add-telegram-token --token "<TELEGRAM_BOT_TOKEN>"
npm run bot -- remove-current-webhook
npm run bot -- get-recent-chat-id
```

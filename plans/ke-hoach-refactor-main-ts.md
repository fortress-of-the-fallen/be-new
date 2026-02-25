# Kế hoạch refactor `src/main.ts`

## Mục tiêu

- Giảm kích thước và độ phức tạp của `src/main.ts` (hiện tại ~438 dòng).
- Tách rõ trách nhiệm theo module: bootstrap app, cấu hình middleware/pipes/filters, swagger, docs portal, tiện ích HTML/Markdown.
- Không thay đổi hành vi runtime hiện tại của API.

## Phạm vi refactor

- Tập trung vào `src/main.ts` và các module mới được tách ra.
- Không thay đổi contract API endpoint hiện tại.
- Không đổi nội dung docs markdown hiện có; chỉ đổi nơi chứa logic render docs.

## Cấu trúc đề xuất

- `src/main.ts`
- `src/bootstrap/app.factory.ts`
: tạo app Nest và chạy seeding.
- `src/bootstrap/app.config.ts`
: cấu hình global pipes, versioning, interceptor, filters, rate-limit.
- `src/bootstrap/swagger.config.ts`
: tạo swagger document, setup `/swagger`, `/swagger/auth`, `/swagger/character`, lọc tag.
- `src/bootstrap/docs/docs.routes.ts`
: đăng ký route docs (`/`, `/docs/auth`, `/docs/character`, `/docs-icon.svg`).
- `src/bootstrap/docs/markdown.renderer.ts`
: `convertMarkdownToHtml`, `renderMarkdownPage`, `withLinksOpenInNewTab`.
- `src/bootstrap/docs/html-template.ts`
: `buildHtmlPage` (CSS + script transform `<h3>` thành collapsible).
- `src/bootstrap/logging/log-cleanup.ts`
: `clearOldLogsIfDev`.

## Nguyên tắc triển khai

- Giữ nguyên thứ tự khởi tạo để tránh regression:
  1. dọn log (dev)
  2. tạo app
  3. seeding
  4. global pipes / middleware / filters / interceptor
  5. swagger
  6. docs routes
  7. listen port
- Tránh import vòng tròn giữa các module bootstrap.
- Ưu tiên hàm thuần (pure function) cho phần dựng swagger/docs.
- Tất cả file mới dùng TypeScript strict-friendly (khai báo type rõ ràng khi hợp lý).

## Kế hoạch theo bước

1. Tạo khung thư mục `src/bootstrap/*`
- Tạo các file module mới theo cấu trúc đề xuất.
- Di chuyển dần helper function từ `main.ts` vào module tương ứng.

2. Tách logic docs rendering
- Chuyển `buildHtmlPage` sang `html-template.ts`.
- Chuyển `convertMarkdownToHtml`, `renderMarkdownPage`, `withLinksOpenInNewTab` sang `markdown.renderer.ts`.
- Tạo `registerDocsRoutes(app)` trong `docs.routes.ts`.

3. Tách logic swagger
- Chuyển cấu hình `DocumentBuilder`, `SwaggerModule.setup` và `filterDocumentByTags` sang `swagger.config.ts`.
- Export hàm `setupSwagger(app)` để gọi từ `main.ts`.

4. Tách cấu hình ứng dụng
- Đưa `ValidationPipe`, `rateLimit`, versioning, global interceptor/filter vào `app.config.ts`.
- Export hàm `configureApp(app)`.

5. Tách tạo app và seeding
- Tạo `createApp()` trong `app.factory.ts` để tạo app + resolve `Seeding` + `seed()`.

6. Thu gọn `main.ts`
- Chỉ giữ orchestration cấp cao:
  - gọi `clearOldLogsIfDev()`
  - `const app = await createApp()`
  - `await configureApp(app)`
  - `await setupSwagger(app)`
  - `registerDocsRoutes(app)`
  - `await app.listen(...)`
- Mục tiêu `main.ts` còn khoảng 40-80 dòng.

7. Kiểm thử và xác nhận
- Chạy `npm run build`.
- Chạy smoke test cục bộ:
  - `GET /` (API portal)
  - `GET /docs/auth`
  - `GET /docs/character`
  - `GET /swagger`
  - `GET /swagger/auth`
  - `GET /swagger/character`
- Kiểm tra tối thiểu 1 API auth + 1 API character vẫn hoạt động.

## Rủi ro và cách giảm thiểu

- Rủi ro đổi thứ tự middleware/filter làm thay đổi response format.
: Giảm thiểu bằng cách giữ nguyên thứ tự gọi như hiện tại.
- Rủi ro lỗi kiểu `this`/scope khi tách function.
: Dùng function thuần, truyền dependency qua tham số.
- Rủi ro sai đường dẫn file markdown/icon.
: Tạo hằng số path tập trung và test từng route docs.

## Tiêu chí hoàn thành

- `src/main.ts` giảm đáng kể số dòng, chỉ còn orchestration.
- Build thành công (`npm run build`).
- Các route swagger/docs hiện có truy cập được.
- Không thay đổi contract API và hành vi error chính.

## Gợi ý chia PR

1. PR 1: tách docs renderer + docs routes.
2. PR 2: tách swagger config.
3. PR 3: tách app config + app factory + dọn `main.ts`.
4. PR 4 (tuỳ chọn): bổ sung test e2e/smoke cho docs và swagger endpoints.

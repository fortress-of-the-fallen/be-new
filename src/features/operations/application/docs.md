# Operations Docs

Tài liệu này gom phần vận hành tối thiểu để dùng khi demo/báo cáo/bảo vệ cho backend Fortress of the Fallen.

- Mục tiêu: trả lời nhanh các câu hỏi kiểu “chạy thế nào”, “phụ thuộc gì”, “log ở đâu”, “lỗi thì kiểm tra gì trước”, “backup/reset ra sao”.
- Base runtime API: `http://127.0.0.1:3000/api/v1`
- API portal: [/](/)
- Swagger tổng: [/swagger](/swagger)
- Đây là **runbook mức đồ án/demo**, không phải playbook production HA.

## 1. Kiến trúc vận hành ngắn gọn

```text
Client / Unity / curl
  → NestJS backend (service web, port 3000)
    → MongoDB replica set (auth + domain data)
    → Redis (cache / fast state / hỗ trợ runtime)
    → MinIO (object storage, uploads, backup files)
    → SMTP (gửi email nếu flow cần)
```

## 2. Dependencies chính

| Thành phần | Vai trò | Mặc định trong repo |
| --- | --- | --- |
| `web` | NestJS API + docs + swagger | `docker-compose.prod.yml` |
| `mongo` | database chính | port nội bộ `27017` |
| `mongo-rs-init` | init replica set `rs0` | one-shot container |
| `redis` | cache / realtime support | port nội bộ `6379` |
| `minio` | object storage | nội bộ `9000`, console `9001` |
| `mc-init` | tạo bucket + app user cho MinIO | one-shot container |
| `ngrok` | public tunnel để demo | optional trong compose prod |
| SMTP | gửi mail | cấu hình qua env |

## 3. Env chính cần biết

Repo load config theo `src/appsettings.json`, sau đó override bằng env uppercase dạng `PARENT_CHILD`.

Các biến quan trọng:

```env
NODE_ENV=development
SERVER_PORT=3000

MONGO_CONNECTIONURL=mongodb://root:[REDACTED]@localhost:27017
MONGO_BASEDBNAME=BaseDatabase
MONGO_UNIVERSALDBNAME=UniversalDatabase
MONGO_AGENDADBNAME=AgendaDatabase

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_CONNECTTIMEOUT=1000

MINIO_URL=http://localhost:9000
MINIO_ROOTUSER=admin
MINIO_ROOTPASSWORD=[REDACTED]
MINIO_USER=appuser
MINIO_USERPASSWORD=[REDACTED]
MINIO_BUCKET=fotf

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_SECURE=false

SECURITY_HMACSECRET=[REDACTED]
APP_ADMINPASSWORD=[REDACTED]
APP_MASTERPASSWORD=[REDACTED]
```

Ghi chú:
- `.env.example` nên được copy thành `.env` hoặc export trực tiếp trước khi chạy local.
- `docker-compose.prod.yml` đang set sẵn phần lớn env cho demo runtime trong container `web`.

## 4. Cách chạy hệ thống

### 4.1. Local app + local dependencies

Dùng khi cần dev/debug trực tiếp backend trên máy host.

**Bước 1: chạy Mongo / Redis / MinIO**

```bash
cd docker
docker compose up -d mongo mongo-rs-init redis minio mc-init
```

**Bước 2: cài package + generate Prisma client**

```bash
npm install
npm run prisma:generate
```

**Bước 3: chạy backend**

```bash
npm run dev
```

### 4.2. Docker runtime mức demo

Dùng khi cần nói về cách deploy/running gói gọn cho đồ án.

```bash
docker compose -f docker-compose.prod.yml up -d
```

Các service chính sau khi lên:
- API: `http://127.0.0.1:3000`
- Swagger: `http://127.0.0.1:3000/swagger`
- Portal docs: `http://127.0.0.1:3000/`
- MinIO console: tùy compose local/dev, thường `http://127.0.0.1:9001`

### 4.3. Shutdown / restart

```bash
# dừng runtime demo
docker compose -f docker-compose.prod.yml down

# restart riêng backend web
docker compose -f docker-compose.prod.yml restart web

# restart toàn stack demo
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

## 5. Checklist smoke check sau khi chạy

### 5.1. Kiểm tra container/process

```bash
docker compose -f docker-compose.prod.yml ps
```

Kỳ vọng:
- `mongo`, `redis`, `minio`, `web` ở trạng thái running
- `mongo-rs-init`, `mc-init` completed successfully

### 5.2. Kiểm tra endpoint public đơn giản

```bash
curl -i http://127.0.0.1:3000/api/v1/configs/manifest
```

Kỳ vọng:
- HTTP 200
- JSON có `success`, `data`, `serverTime`

### 5.3. Kiểm tra docs portal / swagger

```bash
curl -I http://127.0.0.1:3000/
curl -I http://127.0.0.1:3000/swagger
```

### 5.4. Kiểm tra auth flow tối thiểu

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/auth/register' \
  -H 'content-type: application/json' \
  -d '{
    "username": "demo_ops_user",
    "password": "Password123",
    "confirmPassword": "Password123",
    "displayName": "Demo Ops"
  }'
```

Nếu account đã tồn tại thì có thể dùng login:

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/auth/login' \
  -H 'content-type: application/json' \
  -d '{
    "username": "demo_ops_user",
    "password": "Password123"
  }'
```

## 6. Log ở đâu, xem thế nào

## 6.1. Docker logs

Đây là nơi kiểm tra đầu tiên khi backend lỗi trong demo.

```bash
docker compose -f docker-compose.prod.yml logs web --tail=200
docker compose -f docker-compose.prod.yml logs mongo --tail=100
docker compose -f docker-compose.prod.yml logs redis --tail=100
docker compose -f docker-compose.prod.yml logs minio --tail=100
```

## 6.2. Local dev logs

Repo có xử lý cleanup thư mục `logs/` khi chạy `NODE_ENV=development` (`src/bootstrap/logging/log-cleanup.ts`).

Vì vậy khi trình bày có thể nói:
- local dev ưu tiên xem log trực tiếp trên terminal chạy `npm run dev`
- nếu repo/flow sinh file log thì thư mục gốc là `logs/`
- ở môi trường demo Docker, ưu tiên `docker compose logs` vì đó là source dễ kiểm tra nhất

## 7. Khi server lỗi thì kiểm tra gì trước

```text
1. Kiểm tra service web có đang chạy không
   → docker compose -f docker-compose.prod.yml ps

2. Xem log web
   → docker compose -f docker-compose.prod.yml logs web --tail=200

3. Nếu lỗi kết nối DB/cache/storage
   → kiểm tra mongo / redis / minio có running không
   → xem log riêng từng service

4. Nếu API sống nhưng request business fail
   → test lại bằng endpoint public trước: GET /api/v1/configs/manifest
   → sau đó mới test auth/login và protected routes

5. Nếu nghi config/env sai
   → so lại .env / appsettings / compose env
```

Một số dấu hiệu thường gặp:

| Triệu chứng | Kiểm tra nhanh |
| --- | --- |
| `web` restart liên tục | `docker compose ... logs web` |
| login/register fail hàng loạt | Mongo connection URL + replica set init |
| upload/backup file lỗi | MinIO URL / user / bucket |
| request chậm hoặc realtime lỗi | Redis running chưa |
| email không gửi | SMTP host/user/pass |

## 8. Backup / recovery / reset ở mức demo

### 8.1. Backup hiện có trong codebase

Repo đã có `DatabaseBackupJob`:
- cron: `0 0 * * *`
- backup dữ liệu `user` và `session`
- upload file JSON vào MinIO folder `database-backups`
- ghi metadata backup qua `prisma.backup`

Điểm này đủ để trả lời khi bị hỏi “có backup không?”:
- có cơ chế backup nền mức cơ bản
- hiện phạm vi backup đang tập trung vào user/session
- backup file được đẩy lên object storage thay vì giữ thuần local

### 8.2. Recovery ở mức báo cáo

Hiện repo chưa thể hiện đầy đủ một pipeline restore one-click. Câu trả lời an toàn:
- mức đồ án đang ưu tiên **backup + reset + seed lại** hơn là DR production hoàn chỉnh
- nếu hỏng dữ liệu demo, cách recovery nhanh nhất là:
  1. lấy file backup JSON từ MinIO nếu cần giữ account/session
  2. reset stack dữ liệu local/demo
  3. khởi động lại services
  4. seed/config lại theo trạng thái mong muốn

### 8.3. Reset dữ liệu demo nhanh

> Cẩn thận: lệnh này xóa dữ liệu demo local.

```bash
docker compose -f docker-compose.prod.yml down
rm -rf docker/data/mongo docker/data/minio_data
docker compose -f docker-compose.prod.yml up -d
```

Nếu chỉ restart app mà không muốn xóa data:

```bash
docker compose -f docker-compose.prod.yml restart web
```

## 9. Điểm nghẽn / rủi ro nên nói thẳng khi báo cáo

- Chưa phải production-grade CI/CD hoàn chỉnh.
- Recovery hiện thiên về reset + restore thủ công, chưa có full automation.
- `docker-compose.prod.yml` đang phù hợp demo/staging nhỏ, chưa nhắm HA/autoscaling.
- SMTP / ngrok / secrets hiện vẫn cần quản lý env cẩn thận trước khi public thực tế.

## 10. Câu trả lời mẫu cho phần phản biện

### Hệ thống chạy bằng gì, cần service nào?

```text
Backend viết bằng NestJS/Node.js.
Khi chạy demo cần tối thiểu 4 thành phần: web API, MongoDB, Redis và MinIO.
Ngoài ra có thể dùng ngrok để public demo, và SMTP cho email flow nếu bật tính năng đó.
```

### Nếu server lỗi thì kiểm tra ở đâu trước?

```text
Đầu tiên kiểm tra container web có còn sống không bằng docker compose ps.
Sau đó đọc docker compose logs web.
Nếu log cho thấy lỗi dependency thì kiểm tra tiếp Mongo, Redis và MinIO.
```

### Nếu dữ liệu hỏng hoặc cần reset thì làm thế nào?

```text
Ở mức đồ án/demo, cách nhanh nhất là stop stack, xóa volume dữ liệu local rồi up lại.
Nếu cần giữ account/session thì lấy bản backup JSON đã được đẩy lên MinIO từ job backup nền.
```

### Nếu deploy bản mới thì cần kiểm tra gì sau deploy?

```text
Kiểm tra container web đã chạy ổn.
Test endpoint public GET /api/v1/configs/manifest.
Kiểm tra portal / swagger mở được.
Sau đó test nhanh register/login rồi mới test các flow business chính.
```

## 11. Quick links

- API Portal: [/](/)
- Swagger All: [/swagger](/swagger)
- Auth Docs: [/docs/auth](/docs/auth)
- Config Docs: [/docs/config](/docs/config)
- Player Docs: [/docs/player](/docs/player)

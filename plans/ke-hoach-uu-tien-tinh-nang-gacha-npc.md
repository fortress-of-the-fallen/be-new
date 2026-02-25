# Đề xuất tính năng tiếp theo và kế hoạch triển khai

## 1. Kết luận đề xuất

Tính năng nên phát triển tiếp theo: **Gacha NPC cơ bản** (kèm lưu DB và tiêu hao tài nguyên).

## 2. Lý do chọn ưu tiên này

Dựa trên `game-design-docs/README.md` và `game-design-docs/milestone.md`, giai đoạn prototype ưu tiên luồng:
- đăng nhập,
- vào đảo,
- gacha NPC,
- NPC làm việc sinh tài nguyên.

Trong code hiện tại backend đã có:
- Auth (`register/login/logout`),
- Character (`create/list/delete`).

Nhưng **chưa có**:
- NPC model,
- API gacha,
- tài nguyên người chơi để chi trả gacha,
- pipeline nghiệp vụ để tiến tới NPC AI.

Vì vậy, `Gacha NPC` là bước “xương sống” tiếp theo, mở đường trực tiếp cho milestone tháng 2–3.

## 3. Mục tiêu đầu ra của đợt này

- Người chơi có thể gọi API gacha NPC.
- API trừ tài nguyên gacha (ví dụ: `Soul Shards` hoặc `Gold`).
- NPC được random theo pool rarity và lưu DB.
- Có API xem danh sách NPC của người chơi.
- Có log sự kiện gacha để phục vụ theo dõi prototype.

## 4. Phạm vi triển khai (Phase A)

### In scope
- Data model cho NPC và PlayerResource.
- API:
  - `POST /v1/api/npc/gacha`
  - `GET /v1/api/npc`
  - `GET /v1/api/resource` (để client hiển thị)
- Cơ chế random rarity cơ bản (deterministic theo weight, chưa cần pity phức tạp).
- Ràng buộc auth bằng `session-id`.

### Out of scope
- NPC AI làm việc theo lịch 5 phút.
- UI client.
- PvP, combat, economy balancing sâu.
- Cơ chế pity nâng cao / banner event.

## 5. Thiết kế nghiệp vụ đề xuất

### 5.1 Luồng gacha
1. Validate `session-id` và resolve `userId`.
2. Kiểm tra tài nguyên người chơi có đủ chi phí roll.
3. Tạo kết quả roll theo bảng trọng số rarity.
4. Sinh NPC mới (id, name seed, rarity, base stats, personality).
5. Lưu transaction:
- trừ tài nguyên,
- tạo NPC,
- ghi log gacha.
6. Trả kết quả NPC vừa nhận.

### 5.2 Rarity/weight bản đầu
- Common: 70%
- Rare: 22%
- Epic: 7%
- Legendary: 1%

(Có thể tinh chỉnh sau qua config).

### 5.3 Stats NPC bản đầu
- Dùng bộ stat chuẩn theo GDD: `STR, DEX, CON, INT, WIS, CHA`.
- Sinh ngẫu nhiên theo rarity range (ví dụ Common thấp, Legendary cao).
- Chưa cần class unlock phức tạp ở vòng này.

## 6. Đề xuất cấu trúc code (theo style feature hiện tại)

Tạo feature mới: `src/features/npc/application`
- `npc.application-service.ts`
- `gacha/`
  - `gacha-npc.dto.ts`
  - `gacha-npc.application-service.ts`
  - `index.ts`
- `list/`
  - `list-npc.application-service.ts`
  - `index.ts`
- `docs.md`
- `index.ts`

Controller:
- `src/api/controller/v1/npc.controller.ts`

Request/Response models:
- `src/api/model/req/npc/*`
- `src/api/model/res/npc/*`

## 7. Data model đề xuất (Prisma)

### Bảng `PlayerResource`
- `id`
- `userId` (unique)
- `gold`
- `manaCrystal`
- `soulShard`
- `influence`
- `isDeleted`
- `isLocked`

### Bảng `Npc`
- `id`
- `userId`
- `name`
- `rarity`
- `role` (farmer/blacksmith/healer...)
- `str`, `dex`, `con`, `int`, `wis`, `cha`
- `personality`
- `isDeleted`
- `isLocked`
- `createdAt`

### Bảng `GachaLog`
- `id`
- `userId`
- `npcId`
- `costSoulShard`
- `rarity`
- `createdAt`

## 8. Danh sách API đề xuất

### `POST /v1/api/npc/gacha`
- Header: `session-id`
- Input mẫu:
```json
{
  "times": 1
}
```
- Output mẫu:
```json
{
  "success": true,
  "result": {
    "npcId": "...",
    "name": "Lina",
    "rarity": "Rare",
    "stats": {
      "str": 8,
      "dex": 11,
      "con": 9,
      "int": 10,
      "wis": 7,
      "cha": 8
    },
    "personality": "diligent"
  }
}
```

### `GET /v1/api/npc`
- Header: `session-id`
- Trả danh sách NPC thuộc user hiện tại.

### `GET /v1/api/resource`
- Header: `session-id`
- Trả tài nguyên hiện có để client render HUD.

## 9. Kế hoạch triển khai theo bước

1. Chuẩn bị schema + migration
- Cập nhật Prisma schema cho `PlayerResource`, `Npc`, `GachaLog`.
- Seed dữ liệu resource mặc định cho user mới/cũ.

2. Xây feature `npc` theo cấu trúc chuẩn
- Gacha service.
- List NPC service.
- App service orchestration.
- Module wiring.

3. Tạo controller + request/response model
- Thêm `NpcController` và swagger decorators.
- Chuẩn hóa message codes (ví dụ: `Npc.Gacha.NotEnoughSoulShard`).

4. Bổ sung docs
- Tạo `src/features/npc/application/docs.md`.
- Cập nhật link ở `assets/md/swagger-home.md` tới `/docs/npc`.
- (Tuỳ) thêm route render docs trong `src/bootstrap/docs/docs.routes.ts`.

5. Kiểm thử
- `npm run build`.
- Smoke test bằng `curl` cho 3 endpoint.
- Test case lỗi chính: thiếu session, không đủ tài nguyên, user không tồn tại.

## 10. Tiêu chí hoàn thành (Definition of Done)

- Roll gacha tạo được NPC và trừ resource đúng.
- API list NPC trả đúng dữ liệu theo user.
- Có docs feature NPC với sample `curl`.
- Build pass và smoke test pass trong môi trường local có DB.

## 11. Câu lệnh kiểm thử nhanh (đề xuất)

```bash
# 1) Gacha 1 lần
curl -X POST 'http://127.0.0.1:3000/v1/api/npc/gacha' \
  -H 'content-type: application/json' \
  -H 'session-id: <session-id>' \
  -d '{"times":1}'

# 2) Xem danh sách NPC
curl -X GET 'http://127.0.0.1:3000/v1/api/npc' \
  -H 'session-id: <session-id>'

# 3) Xem tài nguyên
curl -X GET 'http://127.0.0.1:3000/v1/api/resource' \
  -H 'session-id: <session-id>'
```

## 12. Hướng phát triển ngay sau Phase A

Sau khi xong Phase A, ưu tiên kế tiếp là **NPC AI cơ bản sinh tài nguyên theo job định kỳ** để chạm milestone tháng 3:
- Job scheduler mỗi 5 phút,
- NPC role ảnh hưởng tốc độ sinh,
- cộng tài nguyên về `PlayerResource` + log event.

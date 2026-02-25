# Kế Hoạch Thiết Kế DB Và Triển Khai Lưu Phần A/B Cho Character Stats

## Phạm vi

Thiết kế và triển khai backend để lưu:

- Phần A: `Base Attributes` (`STR`, `DEX`, `CON`, `INT`, `WIS`, `CHA`) theo GDD.
- Phần B: `Derived Stats` (`HP`, `MP`, `PATK`, `DATK`, `MATK`, `MDEF`, `SPD`, `CRIT`, `ACC`, `EVA`) được tính từ phần A.

Phạm vi áp dụng cho feature `character` trong codebase hiện tại (NestJS + Prisma MongoDB).

## Mục tiêu

- Có cấu trúc dữ liệu rõ ràng, tránh lệch dữ liệu giữa A và B.
- Dễ mở rộng theo race cap, class unlock, equipment buff ở các giai đoạn sau.
- Không phá vỡ API hiện có trong giai đoạn chuyển đổi.
- Đảm bảo thao tác tạo nhân vật và cập nhật chỉ số nhất quán bằng transaction.

## Nguyên tắc thiết kế

- `A` là nguồn dữ liệu gốc (source of truth), luôn lưu đầy đủ.
- `B` là dữ liệu suy diễn từ `A`, được lưu dạng snapshot để đọc nhanh.
- Mọi thay đổi `A` bắt buộc chạy hàm `recalculateDerivedStats` trước khi commit.
- Công thức tính `B` phải có version (`formulaVersion`) để hỗ trợ thay đổi balance về sau.
- Tách dữ liệu chỉ số sang model riêng 1-1 với `Character` để tránh phình document.

## Thiết kế dữ liệu đề xuất

## Model mới: `CharacterStats`

- `id: string` (`_id`)
- `characterId: string` (unique, quan hệ 1-1 với `Character`)
- Nhóm A:
  - `str`, `dex`, `con`, `int`, `wis`, `cha` (int, không âm)
- Nhóm quản trị điểm:
  - `unspentPoints` (int, mặc định 0)
- Nhóm B snapshot:
  - `hp`, `mp`, `patk`, `datk`, `matk`, `mdef`, `spd`, `crit`, `acc`, `eva` (int, không âm)
- Quản lý công thức:
  - `formulaVersion` (int, mặc định 1)
- Audit:
  - `updatedAt`

## Quan hệ và chỉ mục

- `Character` 1-1 `CharacterStats` qua `characterId`.
- Index `characterId` unique.
- (Tuỳ chọn) index `formulaVersion` nếu cần backfill theo lô lớn.

## Lộ trình triển khai

## Giai đoạn 1: Chuẩn bị schema và contract

- Cập nhật `prisma/schema.prisma` thêm model `CharacterStats`.
- Update relation trong model `Character`.
- Sinh Prisma client mới.
- Thêm type/contract nội bộ cho:
  - `BaseAttributes`
  - `DerivedStats`
  - `CharacterStatsSnapshot`

**Đầu ra:** schema sẵn sàng lưu A/B và compile pass.

## Giai đoạn 2: Tạo bộ quy tắc tính chỉ số B

- Tạo service/domain util: `character-stat-calculator`.
- Input: base attributes + ngữ cảnh tối thiểu (race, level nếu cần).
- Output: full `DerivedStats`.
- Chốt rule validate:
  - không cho base âm
  - tổng điểm phân bổ không vượt `unspentPoints + base hiện có`
- Thêm unit test cho calculator:
  - case bình thường
  - case biên
  - case sai dữ liệu

**Đầu ra:** công thức tính B đóng gói một chỗ, test được.

## Giai đoạn 3: Tích hợp khi tạo nhân vật

- Mở rộng luồng `create character`:
  - sau khi tạo `Character` và `CharacterAppearance`, tạo luôn `CharacterStats`.
  - set base mặc định theo race (hoặc default chung nếu chưa áp race cap).
  - tính B lần đầu bằng calculator.
- Thực hiện trong cùng transaction để tránh trạng thái nửa vời.

**Đầu ra:** character mới luôn có đủ A/B.

## Giai đoạn 4: API cập nhật base attributes

- Thêm endpoint cập nhật chỉ số A (ví dụ `PATCH /v1/api/character/:id/stats/base`).
- Validate:
  - ownership theo `session-id`
  - giới hạn điểm
  - race cap (nếu đã sẵn rule)
- Luồng xử lý:
  - update A
  - recalculate B
  - save A/B trong 1 transaction
- Cập nhật response model để trả kèm stats mới.

**Đầu ra:** có luồng chuẩn để thay đổi A và đồng bộ B tức thời.

## Giai đoạn 5: Bổ sung API đọc stats và tài liệu

- Mở rộng API list/detail character để include `stats`.
- Cập nhật `src/features/character/application/docs.md`:
  - endpoint liên quan stats
  - header/auth
  - schema input/output
  - sample curl chính

**Đầu ra:** docs đầy đủ theo quy định dự án.

## Giai đoạn 6: Migration dữ liệu cũ và backfill

- Viết script backfill cho character đã tồn tại nhưng chưa có stats.
- Batch theo số lượng nhỏ để tránh quá tải.
- Log các bản ghi lỗi để retry.
- Nếu đổi công thức:
  - tăng `formulaVersion`
  - chạy recalculate toàn bộ theo version mới.

**Đầu ra:** dữ liệu lịch sử đồng bộ với thiết kế mới.

## Kiểm thử bắt buộc

- Unit test:
  - calculator
  - validate phân bổ điểm
- Integration test:
  - create character có stats
  - update base và kiểm tra derived thay đổi đúng
- API smoke test (curl):
  - tạo nhân vật
  - cập nhật stats
  - đọc lại stats
- Trường hợp môi trường thiếu DB/Redis:
  - ghi rõ blocker
  - cung cấp lệnh curl để xác minh local.

## Rủi ro và phương án giảm thiểu

- Rủi ro lệch công thức giữa nhiều nơi:
  - giảm thiểu bằng 1 calculator trung tâm, cấm tính tay ở controller/service khác.
- Rủi ro race condition khi cộng/trừ điểm:
  - giảm thiểu bằng transaction + kiểm tra điều kiện trong transaction.
- Rủi ro thay đổi balance sau phát hành:
  - giảm thiểu bằng `formulaVersion` + backfill job.

## Definition of Done

- Có model `CharacterStats` và relation 1-1 với `Character`.
- Character mới tạo ra luôn có A và B hợp lệ.
- Có endpoint cập nhật A và tự động đồng bộ B.
- API trả về stats cho luồng đọc character.
- Tài liệu `docs.md` của feature `character` được cập nhật đầy đủ.
- Test chính pass, có smoke test/curl xác minh luồng chính.

## Bước triển khai ngay

1. Tạo schema `CharacterStats` + calculator + unit test.
2. Tích hợp vào luồng `create character`.
3. Thêm API cập nhật base attributes và cập nhật docs.
4. Chạy smoke test và backfill dữ liệu cũ.

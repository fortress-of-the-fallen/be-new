# Test Coverage Baseline cho các luồng API nghiệp vụ chính

> Tài liệu mức báo cáo/demo để chuẩn bị phần kiểm chứng cho backend API.  
> Mục tiêu là chứng minh hệ thống không chỉ “có endpoint” mà còn có kế hoạch và tiêu chí kiểm thử rõ ràng cho các luồng nghiệp vụ dễ bị hỏi khi bảo vệ.

## 1. Mục tiêu

Tài liệu này dùng để chốt baseline coverage cho các nhóm API quan trọng:

- auth
- shop
- quest
- battle
- player / inventory / formation

Đầu ra mong muốn:
- biết feature nào cần ưu tiên test trước
- biết mỗi feature cần cover happy path, validation và business conflict gì
- có checklist dùng để rà khi backend implementation sẵn sàng
- có script/cách trình bày để trả lời phần phản biện về test coverage

## 2. Phạm vi

### In scope

- rà bề mặt nghiệp vụ chính cần có test
- xác định các nhóm case ưu tiên cao
- chuẩn hóa expected behavior cho success / invalid / conflict
- chuẩn bị checklist coverage dùng cho unit/integration test
- chuẩn bị bằng chứng/report format để đưa vào slide hoặc báo cáo

### Out of scope

- benchmark tải production
- UI/frontend test
- refactor lớn không phục vụ trực tiếp cho coverage
- viết đầy đủ toàn bộ test code khi source backend chưa có trên nhánh `main`

## 3. Tư duy coverage cần có

```text
Test input
  → Application service / controller
    → validate input
    → check auth / guard nếu có
    → apply business rules
    → call repository / transaction / dependency mock
    → return success response hoặc domain/business error
```

Một flow được coi là cover đủ tối thiểu khi có:
- happy path
- validation fail
- business conflict / duplicate / forbidden case
- side effect đúng (state update, reward update, tiền bị trừ, không bị trừ 2 lần...)

## 4. Ma trận ưu tiên coverage

| Feature | Mức ưu tiên | Vì sao |
| --- | --- | --- |
| Auth | Rất cao | dễ bị hỏi nhất khi báo cáo, liên quan đến login/session/security |
| Shop | Rất cao | có tiền/tài nguyên/idempotency → dễ có bug nghiệp vụ |
| Quest | Rất cao | có trạng thái đủ điều kiện / claim / claim lặp lại |
| Battle | Cao | liên quan state transition, reward, validation input |
| Player / Inventory / Formation | Cao | nhiều validation và state update |
| Các feature phụ khác | Trung bình | bổ sung sau khi core flow đã xanh |

## 5. Checklist coverage theo feature

## 5.1. Auth

Các case nên có:

### Login
- username/password đúng → login thành công
- sai password → reject đúng lỗi
- user inactive / banned (nếu có) → không login được
- payload thiếu field → validation fail
- password sai nhiều lần → nếu có throttle/guard thì hành vi phải rõ

### Refresh token
- refresh token hợp lệ → cấp token mới
- refresh token sai / hết hạn / bị revoke → reject
- refresh token đã dùng sai cách → không tái sử dụng trái thiết kế

### Logout
- logout thành công → session/token cũ không dùng sai cách được nữa
- logout với token không hợp lệ → reject đúng chuẩn

### Evidence nên có
- response success
- response `400` cho payload sai
- response `401` hoặc lỗi domain tương ứng cho token sai

## 5.2. Shop

Các case nên có:

- đủ tiền → mua thành công
- thiếu tiền → reject rõ ràng
- quantity invalid → reject
- vượt limit mua/ngày (nếu có) → reject
- item không tồn tại / config sai → reject
- cùng idempotency key không bị trừ tiền 2 lần
- cùng key nhưng payload khác → conflict hoặc lỗi guard tương đương

### Side effect cần assert
- gold/currency bị trừ đúng một lần
- inventory tăng đúng số lượng
- transaction/repository được gọi đúng thứ tự tối thiểu

## 5.3. Quest

Các case nên có:

- chưa đủ điều kiện → không claim được
- đủ điều kiện → claim thành công
- claim lặp lại → reject hoặc reused response đúng thiết kế
- quest id sai / stage sai → reject
- reward update đúng sau khi claim

### Side effect cần assert
- quest state chuyển đúng
- reward/currency được cộng đúng
- không claim 2 lần cùng reward

## 5.4. Battle

Các case nên có:

### Start battle
- input hợp lệ → tạo battle/session hợp lệ
- config version sai / thiếu (nếu có) → reject
- đội hình/state không hợp lệ → reject

### Finish battle
- finish hợp lệ → reward/state update đúng
- battle đã finish rồi → reject
- battle expired / state sai → reject
- payload sai → validation fail

### Side effect cần assert
- reward được cộng đúng
- state battle đổi đúng
- progression/quest/leaderboard sync đúng nếu flow có liên quan

## 5.5. Player / Inventory / Formation

Các case nên có:

- update profile hợp lệ
- rename / update vượt rule → reject
- upgrade/evolve đủ tài nguyên → thành công
- thiếu tài nguyên → reject
- đội hình không hợp lệ → reject
- item/hero không tồn tại → reject

### Side effect cần assert
- state chỉ update khi pass toàn bộ business rules
- resource không bị trừ khi request fail

## 6. Checklist validation bắt buộc

Bất kể feature nào cũng nên rà các nhóm validation sau:

- thiếu field bắt buộc
- sai kiểu dữ liệu
- giá trị âm / out-of-range
- enum không hợp lệ
- header quan trọng bị thiếu
- query param sai format
- id rỗng / không đúng format

Kỳ vọng:
- fail sớm
- trả error rõ ràng
- không lộ stack trace nội bộ

## 7. Checklist business conflict bắt buộc

Các case này rất hay bị hỏi khi báo cáo:

- double-submit / retry request
- thiếu tiền / thiếu tài nguyên
- state không hợp lệ cho action hiện tại
- object không tồn tại
- object đã claim / đã finish / đã mua rồi
- config version mismatch (nếu hệ thống dùng runtime config versioning)

## 8. Bằng chứng coverage nên chuẩn bị cho báo cáo

## 8.1. Dạng evidence tối thiểu

- danh sách file test theo feature
- danh sách case đã cover
- output `npm test -- --runInBand`
- nếu có thể: coverage summary hoặc ít nhất số spec pass

## 8.2. Dạng trình bày gợi ý

```text
Auth
  → login đúng / sai password
  → refresh token hợp lệ / không hợp lệ
  → logout revoke session

Shop
  → đủ tiền / thiếu tiền
  → quantity invalid
  → idempotency không trừ tiền 2 lần

Quest
  → chưa đủ điều kiện
  → claim thành công
  → claim lặp lại bị chặn
```

## 9. Kế hoạch triển khai khi source code backend đã sẵn sàng

### Bước 1. Thống kê coverage hiện có

- liệt kê các file `*.spec.ts`
- map test hiện có theo feature
- ghi lại feature nào chưa có coverage hoặc coverage mỏng

### Bước 2. Chọn nhóm ưu tiên cao nhất

Thứ tự đề xuất:
1. auth
2. shop
3. quest
4. battle
5. player / inventory / formation

### Bước 3. Viết test theo 3 nhóm chuẩn

Mỗi flow ưu tiên nên có:
- happy path
- validation fail
- business conflict / duplicate submit

### Bước 4. Chạy test ổn định

```bash
npm test -- --runInBand
```

Nếu repo có test integration riêng thì thêm command tương ứng vào checklist dự án.

### Bước 5. Chụp lại evidence cho báo cáo

- số test pass
- ảnh/copy coverage summary
- danh sách case nổi bật theo feature

## 10. Mẫu câu trả lời khi bị hỏi phản biện

### Backend đã test những gì quan trọng nhất?

```text
Nhóm ưu tiên cao nhất là auth, shop, quest và battle.
Đây là các flow dễ phát sinh lỗi nghiệp vụ, side effect và cũng là nhóm dễ bị hỏi nhất khi báo cáo.
```

### Test chỉ cover happy path hay có cover lỗi?

```text
Coverage được định hướng theo 3 nhóm: happy path, validation fail và business conflict.
Ví dụ shop không chỉ test mua thành công mà còn test thiếu tiền, quantity invalid và idempotency key trùng.
```

### Làm sao chứng minh không bị double-submit?

```text
Các flow mutate state cần có test idempotency hoặc guard tương đương.
Khi gửi lại cùng request, hệ thống phải reuse kết quả hoặc từ chối conflict, không được trừ tài nguyên hai lần.
```

### Vì sao không cố tăng coverage toàn bộ ngay?

```text
Mục tiêu báo cáo là chứng minh chất lượng ở các luồng nghiệp vụ chính trước.
Vì vậy coverage được ưu tiên theo rủi ro: auth, shop, quest, battle trước; các phần còn lại làm sau để tránh dàn trải.
```

## 11. Definition of Done cho issue này

Issue #4 được xem là đạt ở mức artifact/report readiness khi:

- có ma trận ưu tiên coverage theo feature
- có checklist test cho ít nhất auth, shop, quest, battle
- có guideline cho happy path / validation / conflict
- có format evidence để đưa vào báo cáo
- có kế hoạch rõ để áp vào source backend khi implementation branch sẵn sàng

## 12. Ghi chú triển khai

Vì nhánh `main` hiện chưa chứa source backend hoàn chỉnh, tài liệu này đóng vai trò **coverage baseline / execution plan** để áp vào nhánh triển khai backend sau.

Khi source code đã có trên nhánh làm việc chính, bước tiếp theo là:

1. map tài liệu này vào từng `*.spec.ts` thực tế
2. bổ sung các case còn thiếu theo thứ tự ưu tiên
3. chạy test thật và lưu evidence pass
4. mở follow-up issue nếu phát hiện feature có rủi ro nhưng chưa đủ điều kiện test

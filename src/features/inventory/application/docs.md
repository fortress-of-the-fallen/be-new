# Inventory Docs

Tài liệu này mô tả inventory read flow và các mutation cho hero/skill.

- Base path: `/api/v1/inventory`
- Protected routes: yêu cầu `Authorization: Bearer <accessToken>`
- Thành công dùng envelope `{ success, data, serverTime }`
- Các mutation phụ thuộc `configVersion` sẽ trả `CONFIG_MISMATCH` nếu client đang stale

## Routes

<details>
<summary><strong>Get Inventory - <code>GET /api/v1/inventory</code></strong></summary>

**Mô tả route**

Trả về inventory hiện tại, tách riêng `heroes` và `skills`.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Không có body request.

**Output Schema**

```json
{
  "success": true,
  "data": {
    "heroes": [
      {
        "instanceId": "p_abc123_hi_soldier",
        "itemId": "Soldier",
        "itemType": "hero",
        "itemClass": "Unit",
        "remainingUses": 0,
        "customData": {
          "lv": "1",
          "evlove_lv": "1",
          "evlove_value": "1"
        }
      }
    ],
    "skills": [
      {
        "instanceId": "p_abc123_si_pray",
        "itemId": "Pray",
        "itemType": "skill",
        "itemClass": null,
        "remainingUses": 0,
        "customData": {
          "lv": "1",
          "lv_skill": "1"
        }
      }
    ]
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |

**Sample curl**

```bash
curl -X GET 'http://127.0.0.1:3000/api/v1/inventory' \
  -H 'Authorization: Bearer <access-token>'
```

</details>

<details>
<summary><strong>Upgrade Hero - <code>POST /api/v1/inventory/heroes/:instanceId/upgrade</code></strong></summary>

**Mô tả route**

Tăng level hero lên 1, trừ resource theo active config, cập nhật quest progress liên quan, và đồng bộ `tutorialProgress` nếu đây là lần đầu player hoàn tất upgrade tutorial.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Path param:
- `instanceId: string`

Body:

```json
{
  "configVersion": "2026.05.02.1",
  "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00011"
}
```

**Output Schema**

```json
{
  "success": true,
  "data": {
    "updatedHero": {
      "instanceId": "p_abc123_hi_soldier",
      "itemId": "Soldier",
      "itemType": "hero",
      "itemClass": "Unit",
      "remainingUses": 0,
      "customData": {
        "lv": "2",
        "evlove_lv": "1",
        "evlove_value": "1"
      }
    },
    "hero": {
      "instanceId": "p_abc123_hi_soldier",
      "itemId": "Soldier",
      "itemType": "hero",
      "itemClass": "Unit",
      "remainingUses": 0,
      "customData": {
        "lv": "2",
        "evlove_lv": "1",
        "evlove_value": "1"
      }
    },
    "consumed": [
      {
        "itemId": "GO",
        "quantity": 50
      },
      {
        "itemId": "NormalShard",
        "quantity": 2
      }
    ],
    "currency": {
      "peasant": 0,
      "gold": 530,
      "gem": 0,
      "normalShard": 2,
      "eliteShard": 0,
      "specialShard": 0
    },
    "tutorialProgress": {
      "finishOnboarding": true,
      "finishIntro": true,
      "finishFirstDeploy": true,
      "finishFirstBattle": true,
      "finishFirstDragUnit": true,
      "finishFirstDeployArcher": true,
      "finishFirstDeployBarricade": true,
      "finishFirstDeployCavalry": true,
      "finishUpgradeArcher": true,
      "finishUpgradeBase": true,
      "finishUpgradeUnitStat": true,
      "finishPurchaseSkill": true,
      "finishPvP": true,
      "isDoneUpgradeUnitTutorial": true,
      "updatedAt": "2026-05-04T10:00:00.000Z"
    },
    "questUpdates": [
      {
        "questId": 3,
        "type": "daily",
        "actionId": "UPGRADE_UNIT",
        "progress": 1,
        "required": 1,
        "isCompleted": true,
        "rewardClaimed": false
      }
    ]
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

Ghi chú:
- Nếu sau mutation inventory đã có ít nhất một hero với `customData.lv > 1`, server sẽ trả `tutorialProgress.isDoneUpgradeUnitTutorial = true`.
- Route này không tự thay đổi `finishOnboarding` hoặc `finishFirstDeploy`; hai cờ đó vẫn đi theo flow battle/tutorial tương ứng.
- `updatedHero` là field canonical mới; `hero` vẫn được giữ như alias compatibility.
- `consumed` luôn là danh sách resource đã tiêu thụ với số lượng dương và phải khớp persisted balance trong `currency`.
- Theo active config hiện tại, tutorial upgrade cho hero normal từ level 1 lên 2 tiêu thụ `50 GO + 2 NormalShard`.

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `VALIDATION_FAILED` | Thiếu `configVersion`, thiếu `idempotencyKey`, hoặc body sai schema. |
| `CONFIG_MISMATCH` | `configVersion` client không trùng active server config. |
| `NOT_FOUND` | Không tìm thấy hero instance hoặc upgrade rule tương ứng. |
| `INSUFFICIENT_RESOURCE` | Không đủ gold/shard để trả cost. |
| `IDEMPOTENCY_CONFLICT` | Cùng `idempotencyKey` nhưng payload khác. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/inventory/heroes/hi_soldier_001/upgrade' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "configVersion": "2026.05.02.1",
    "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00011"
  }'
```

</details>

<details>
<summary><strong>Evolve Hero - <code>POST /api/v1/inventory/heroes/:instanceId/evolve</code></strong></summary>

**Mô tả route**

Tiêu thụ bản sao cùng `itemId` để tăng `evlove_lv` cho hero chính.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Path param:
- `instanceId: string`

Body:

```json
{
  "configVersion": "2026.05.02.1",
  "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00012"
}
```

**Output Schema**

```json
{
  "success": true,
  "data": {
    "hero": {
      "instanceId": "hi_soldier_001",
      "itemId": "Soldier",
      "itemType": "hero",
      "customData": {
        "lv": "2",
        "evlove_lv": "2",
        "evlove_value": "1"
      }
    },
    "consumed": [
      {
        "itemId": "Soldier",
        "quantity": 2
      }
    ],
    "currency": {
      "peasant": 0,
      "gold": 220,
      "gem": 0,
      "normalShard": 0,
      "eliteShard": 0,
      "specialShard": 0
    }
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `VALIDATION_FAILED` | Thiếu `configVersion`, thiếu `idempotencyKey`, hoặc body sai schema. |
| `CONFIG_MISMATCH` | `configVersion` client không trùng active server config. |
| `NOT_FOUND` | Không tìm thấy hero instance hoặc evolve rule tương ứng. |
| `INSUFFICIENT_RESOURCE` | Không đủ duplicate copies hoặc không đủ currency để evolve. |
| `IDEMPOTENCY_CONFLICT` | Cùng `idempotencyKey` nhưng payload khác. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/inventory/heroes/hi_soldier_001/evolve' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "configVersion": "2026.05.02.1",
    "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00012"
  }'
```

</details>

<details>
<summary><strong>Purchase Skill - <code>POST /api/v1/inventory/skills/:itemId/purchase</code></strong></summary>

**Mô tả route**

Mua một skill mới theo `itemId` và trừ currency theo purchase rule.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Path param:
- `itemId: string`

Body:

```json
{
  "configVersion": "2026.05.02.1",
  "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00013"
}
```

**Output Schema**

```json
{
  "success": true,
  "data": {
    "skill": {
      "instanceId": "si_pray_abc123",
      "itemId": "Pray",
      "itemType": "skill",
      "customData": {
        "lv": "1",
        "lv_skill": "1"
      }
    },
    "currency": {
      "peasant": 0,
      "gold": 500,
      "gem": 0,
      "normalShard": 2,
      "eliteShard": 0,
      "specialShard": 0
    }
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `VALIDATION_FAILED` | Thiếu `configVersion`, thiếu `idempotencyKey`, hoặc body sai schema. |
| `CONFIG_MISMATCH` | `configVersion` client không trùng active server config. |
| `NOT_FOUND` | Không tìm thấy skill purchase rule cho `itemId`. |
| `INSUFFICIENT_RESOURCE` | Không đủ currency để mua skill. |
| `IDEMPOTENCY_CONFLICT` | Cùng `idempotencyKey` nhưng payload khác. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/inventory/skills/Pray/purchase' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "configVersion": "2026.05.02.1",
    "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00013"
  }'
```

</details>

<details>
<summary><strong>Upgrade Skill - <code>POST /api/v1/inventory/skills/:instanceId/upgrade</code></strong></summary>

**Mô tả route**

Tăng level một skill instance đã sở hữu.

**Authentication**

- Bắt buộc: `Authorization: Bearer <accessToken>`

**Input Schema**

Path param:
- `instanceId: string`

Body:

```json
{
  "configVersion": "2026.05.02.1",
  "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00014"
}
```

**Output Schema**

```json
{
  "success": true,
  "data": {
    "skill": {
      "instanceId": "si_pray_abc123",
      "itemId": "Pray",
      "itemType": "skill",
      "customData": {
        "lv": "2",
        "lv_skill": "2"
      }
    },
    "currency": {
      "peasant": 0,
      "gold": 500,
      "gem": 0,
      "normalShard": 5,
      "eliteShard": 0,
      "specialShard": 0
    }
  },
  "serverTime": "2026-05-04T10:00:00.000Z"
}
```

**Error Messages**

| Error code | Mô tả |
| --- | --- |
| `UNAUTHORIZED` | Thiếu bearer token hoặc token không hợp lệ/hết hạn. |
| `FORBIDDEN` | Access token hợp lệ nhưng role không được phép. |
| `VALIDATION_FAILED` | Thiếu `configVersion`, thiếu `idempotencyKey`, hoặc body sai schema. |
| `CONFIG_MISMATCH` | `configVersion` client không trùng active server config. |
| `NOT_FOUND` | Không tìm thấy skill instance hoặc upgrade rule tương ứng. |
| `INSUFFICIENT_RESOURCE` | Không đủ currency để upgrade skill. |
| `IDEMPOTENCY_CONFLICT` | Cùng `idempotencyKey` nhưng payload khác. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/inventory/skills/si_pray_abc123/upgrade' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <access-token>' \
  -d '{
    "configVersion": "2026.05.02.1",
    "idempotencyKey": "bb6ef5e8-26b6-4f49-9d55-6b0f56a00014"
  }'
```

</details>

## Quick Links

- API Portal: [/](/)
- Swagger Inventory: [/swagger/inventory](/swagger/inventory)
- Formation Docs: [/docs/formation](/docs/formation)

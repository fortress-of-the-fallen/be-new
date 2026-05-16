# Shop Docs

Tai lieu nay mo ta catalog shop va mutation mua chest theo flow server-authoritative cho `UIShop`.

- Base path: `/api/v1/shop`
- Protected routes: yeu cau `Authorization: Bearer ***`
- Thanh cong dung envelope `{ success, data, serverTime }`
- Mutation mua offer phu thuoc `configVersion` + `idempotencyKey`

## Routes

<details>
<summary><strong>Get Catalog - <code>GET /api/v1/shop/catalog</code></strong></summary>

**Mo ta route**

Tra ve danh sach offer dang ban, currency hien tai, `configVersion` dang active va `resetAt` UTC cho daily limit.

**Authentication**

- Bat buoc: `Authorization: Bearer ***`

**Input Schema**

Khong co body request.

**Output Schema**

```json
{
  "success": true,
  "data": {
    "configVersion": "2026.05.02.1",
    "resetAt": "2026-05-11T00:00:00.000Z",
    "currency": {
      "peasant": 0,
      "gold": 730,
      "gem": 1200,
      "normalShard": 4,
      "eliteShard": 1,
      "specialShard": 0
    },
    "offers": [
      {
        "offerId": "chest_wooden",
        "displayName": "Wooden Chest",
        "category": "CHEST",
        "itemType": "CHEST",
        "itemId": "WoodenChest",
        "iconId": "icon_chest_wooden",
        "priceCurrency": "GO",
        "priceAmount": 80,
        "maxPurchasePerDay": 999,
        "purchasedToday": 0,
        "isAvailable": true,
        "rewardRates": [
          { "itemId": "GO", "minQty": 50, "maxQty": 80, "weight": 5000 },
          { "itemId": "NormalShard", "minQty": 1, "maxQty": 2, "weight": 3500 }
        ]
      }
    ]
  },
  "serverTime": "2026-05-10T10:20:00.000Z"
}
```

**Error Messages**

| Error code | Mo ta |
| --- | --- |
| `UNAUTHORIZED` | Thieu bearer token hoac token khong hop le/het han. |
| `FORBIDDEN` | Access token hop le nhung role khong duoc phep. |
| `NOT_FOUND` | Khong tim thay player hien tai. |

**Sample curl**

```bash
curl -X GET 'http://127.0.0.1:3000/api/v1/shop/catalog' \
  -H 'Authorization: Bearer ***'
```

</details>

<details>
<summary><strong>Purchase Offer - <code>POST /api/v1/shop/offers/:offerId/purchase</code></strong></summary>

**Mo ta route**

Mua offer chest, tru currency dung mot lan theo `idempotencyKey`, roll reward tu config server va tra ve `grantedRewards` + `currency` moi de client render popup ngay.

**Authentication**

- Bat buoc: `Authorization: Bearer ***`

**Input Schema**

Path param:
- `offerId: string`

Body:

```json
{
  "configVersion": "2026.05.02.1",
  "idempotencyKey": "53a86910-c30f-4f3d-bdfb-4f8bd4e74557",
  "quantity": 1
}
```

**Output Schema**

```json
{
  "success": true,
  "data": {
    "offerId": "chest_wooden",
    "quantity": 1,
    "spentCurrency": "GO",
    "spentAmount": 80,
    "currency": {
      "peasant": 0,
      "gold": 420,
      "gem": 1200,
      "normalShard": 5,
      "eliteShard": 2,
      "specialShard": 0
    },
    "grantedRewards": [
      { "itemId": "NormalShard", "quantity": 1 },
      { "itemId": "EliteShard", "quantity": 1 }
    ],
    "rewards": [
      { "itemId": "NormalShard", "quantity": 1 },
      { "itemId": "EliteShard", "quantity": 1 }
    ],
    "statistics": {
      "level": 1,
      "exp": 0,
      "score": 0,
      "stageCampaign": 1,
      "levelCastle": 0,
      "lobbyUpgradeSpent": 0
    }
  },
  "serverTime": "2026-05-10T10:20:05.000Z"
}
```

**Error Messages**

| Error code | Mo ta |
| --- | --- |
| `VALIDATION_FAILED` | Body sai schema, thieu `configVersion`, `idempotencyKey`, hoac `quantity < 1`. |
| `CONFIG_VERSION_MISMATCH` | `configVersion` client khong trung active server config. |
| `INSUFFICIENT_CURRENCY` | Khong du currency de mua offer. |
| `SHOP_OFFER_UNAVAILABLE` | Offer khong ton tai, da het daily limit, hoac dang bi disable. |
| `IDEMPOTENCY_CONFLICT` | Cung `idempotencyKey` nhung payload khac. |

**Sample curl**

```bash
curl -X POST 'http://127.0.0.1:3000/api/v1/shop/offers/chest_wooden/purchase' \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer ***' \
  -d '{
    "configVersion": "2026.05.02.1",
    "idempotencyKey": "53a86910-c30f-4f3d-bdfb-4f8bd4e74557",
    "quantity": 1
  }'
```

</details>

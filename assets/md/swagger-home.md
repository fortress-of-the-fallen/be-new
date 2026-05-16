# API Portal

Trang này là cổng điều hướng cho contract `/api/v1` hiện tại.

## Base Contract

- Base URL: `/api/v1`
- Protected routes: `Authorization: Bearer ***`
- Public routes: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET /api/v1/configs/*`
- Success envelope chuẩn mới: `{ success, data, serverTime }`
- Character hiện vẫn giữ compatibility success envelope: `{ success, errorCode, error, timestamp, result? }`

## Swagger Pages

- All APIs: [/swagger](/swagger)
- Auth: [/swagger/auth](/swagger/auth)
- Character: [/swagger/character](/swagger/character)
- Player: [/swagger/player](/swagger/player)
- Inventory: [/swagger/inventory](/swagger/inventory)
- Formation: [/swagger/formation](/swagger/formation)
- Quest: [/swagger/quest](/swagger/quest)
- Battle: [/swagger/battle](/swagger/battle)
- Leaderboard: [/swagger/leaderboard](/swagger/leaderboard)
- Lobby: [/swagger/lobby](/swagger/lobby)
- Config: [/swagger/config](/swagger/config)

## Feature Docs

- Auth: [/docs/auth](/docs/auth)
- Player: [/docs/player](/docs/player)
- Character: [/docs/character](/docs/character)
- Inventory: [/docs/inventory](/docs/inventory)
- Formation: [/docs/formation](/docs/formation)
- Quest: [/docs/quest](/docs/quest)
- Shop: [/docs/shop](/docs/shop)
- Battle: [/docs/battle](/docs/battle)
- Leaderboard: [/docs/leaderboard](/docs/leaderboard)
- Lobby: [/docs/lobby](/docs/lobby)
- Config: [/docs/config](/docs/config)
- Operations / Deploy / Recovery: [/docs/operations](/docs/operations)

## Shared References

- API Overview + Error Handling: [/swagger](/swagger)
- Environment Config: [Google Sheet](https://docs.google.com/spreadsheets/d/1gPHUbUbTPOIgvykkxbRK4BGK1JGbZBNVgmBMmJw6ItI/edit?usp=sharing)

## LLM Copy Pack

Copy toàn bộ block dưới đây khi cần đưa ngữ cảnh backend hiện tại cho LLM khác. Nội dung này cố ý cực kỳ chi tiết và ưu tiên **runtime contract đang chạy** hơn suy đoán.

~~~text
FOTF BACKEND LLM CONTEXT PACK

Public API portal URL:
- https://willed-unstamped-gothic.ngrok-free.dev/

Primary contract identity:
- Project: Fortress of the Fallen backend
- Runtime API base path: /api/v1
- API style: JSON only
- Main contract model: server-authoritative backend for player state, inventory progression, quest rewards, battle settlement, leaderboard, matchmaking, and config delivery
- This backend is not a full deterministic combat simulator yet; battle v1 is a validated session + reward settlement flow

Relevant public docs URLs:
- Root portal: /
- Swagger all: /swagger
- Swagger auth: /swagger/auth
- Swagger character: /swagger/character
- Swagger player: /swagger/player
- Swagger inventory: /swagger/inventory
- Swagger formation: /swagger/formation
- Swagger quest: /swagger/quest
- Swagger battle: /swagger/battle
- Swagger leaderboard: /swagger/leaderboard
- Swagger config: /swagger/config
- Feature docs auth: /docs/auth
- Feature docs player: /docs/player
- Feature docs character: /docs/character
- Feature docs inventory: /docs/inventory
- Feature docs formation: /docs/formation
- Feature docs quest: /docs/quest
- Feature docs shop: /docs/shop
- Feature docs battle: /docs/battle
- Feature docs leaderboard: /docs/leaderboard
- Feature docs config: /docs/config
- Feature docs operations: /docs/operations

1. GLOBAL CONTRACT RULES

1.1 Base URL
- All primary game APIs live under /api/v1

1.2 Authentication
- Protected endpoints require header: Authorization: Bearer ***
- Public endpoints:
  - POST /api/v1/auth/register
  - POST /api/v1/auth/login
  - POST /api/v1/auth/refresh
  - GET /api/v1/configs/manifest
  - GET /api/v1/configs/:name

1.3 Success envelope used by most new APIs
- Shape:
  {
    "success": true,
    "data": {},
    "serverTime": "ISO-8601 timestamp"
  }

1.4 Error envelope used by most new APIs
- Shape:
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "Human readable message",
      "details": {}
    },
    "serverTime": "ISO-8601 timestamp"
  }

1.5 Error codes currently used
- UNAUTHORIZED
- FORBIDDEN
- VALIDATION_FAILED
- NOT_FOUND
- USERNAME_TAKEN
- INVALID_CREDENTIALS
- INSUFFICIENT_RESOURCE
- ALREADY_CLAIMED
- CONFIG_VERSION_MISSING
- CONFIG_VERSION_MISMATCH
- INSUFFICIENT_GOLD
- MAX_CASTLE_LEVEL
- BATTLE_EXPIRED
- BATTLE_ALREADY_FINISHED
- IDEMPOTENCY_CONFLICT
- INTERNAL_SERVER_ERROR

1.6 Idempotency
- Important mutating business endpoints store and reuse results by player + idempotencyKey
- This is implemented for:
  - PATCH /api/v1/me/profile
  - POST /api/v1/inventory/heroes/:instanceId/upgrade
  - POST /api/v1/inventory/heroes/:instanceId/evolve
  - POST /api/v1/inventory/skills/:itemId/purchase
  - POST /api/v1/inventory/skills/:instanceId/upgrade
  - POST /api/v1/quests/:questId/claim
  - POST /api/v1/quests/progress-rewards/:track/:stage/claim
  - POST /api/v1/battles/:battleId/finish
- Same player + same idempotencyKey + same payload returns reused response
- Same player + same idempotencyKey + different payload returns IDEMPOTENCY_CONFLICT

1.7 Config version checks
- Config-dependent mutations require configVersion
- Current server behavior rejects missing client configVersion with CONFIG_VERSION_MISSING
- Current server behavior rejects stale client configVersion with CONFIG_VERSION_MISMATCH
- This is enforced for:
  - battle start
  - inventory hero upgrade
  - inventory hero evolve
  - inventory skill purchase
  - inventory skill upgrade

1.8 HTTP status nuance
- Runtime behavior currently uses HTTP 201 for most POST success responses, including some endpoints where external readers may expect 200
- Do not assume all successful POST endpoints return 200
- GET / PUT / PATCH success typically returns 200

1.9 Rate limiting
- Rate limiting is enabled on many routes
- Fast repeated testing may return 429 Too Many Requests
- This is operational behavior even if a consuming spec omits it

2. AUTH MODEL

2.1 Token model
- Access token:
  - Bearer token
  - Short-lived
  - Used on protected endpoints
- Refresh token:
  - Opaque token
  - Stored server-side in refresh_tokens collection/table
  - Rotated on refresh
  - Revoked on logout

2.2 Register
- POST /api/v1/auth/register
- Input:
  {
    "username": "player01",
    "password": "secret123",
    "confirmPassword": "secret123",
    "displayName": "Player01"
  }
- Rules:
  - username required
  - username length 3..32
  - password length 8..64
  - displayName optional
  - if displayName omitted, backend defaults to username semantics at player bootstrap level
- Output data:
  - accessToken
  - refreshToken
  - player.playerId
  - player.username
  - player.displayName

2.3 Login
- POST /api/v1/auth/login
- Input:
  {
    "username": "player01",
    "password": "secret123",
    "rememberMe": true,
    "connectionId": "optional-socket-id"
  }
- Output data:
  - accessToken
  - refreshToken
  - player summary

2.4 Refresh
- POST /api/v1/auth/refresh
- Input:
  {
    "refreshToken": "refresh-token"
  }
- Output data:
  - new accessToken
  - new refreshToken

2.5 Logout
- POST /api/v1/auth/logout
- Requires bearer access token
- Input:
  {
    "refreshToken": "refresh-token"
  }
- Output data:
  {
    "revoked": true
  }

3. PLAYER STATE MODEL

3.1 GET /api/v1/me
- Returns a server-hydrated player overview object with:
  - playerId
  - profile
  - statistics
  - currency
  - inventory
  - formation
  - quests
  - configVersion

3.2 Profile shape
- displayName: string
- avatar: string
- country: string

3.3 Statistics fields currently carried in player state
- levelMap
- wave
- gameCoin
- expBattle
- levelBattle
- level
- exp
- statPointsAvailable
- statPointsSpent
- coreStats:
  - strength
  - dexterity
  - constitution
  - intelligence
  - wisdom
  - charisma
- karma
- affinity
- luck
- resistance
- changedName
- score
- levelCastle
- stageCampaign
- lobbyUpgradeSpent

3.4 Currency fields
- peasant
- gold
- gem
- normalShard
- eliteShard
- specialShard

3.5 PATCH /api/v1/me/profile
- Input:
  {
    "displayName": "NewName",
    "avatar": "avatar_01",
    "country": "VN",
    "idempotencyKey": "uuid-like-string"
  }
- Behavior:
  - validates avatar against spriteResource config
  - trims displayName
  - validates displayName minimum length
  - uppercases country
  - charges rename cost from config when displayName changes
  - syncs leaderboard projection after update
- Output data:
  - updated profile
  - current currency

4. INVENTORY MODEL

4.1 Inventory split
- GET /api/v1/inventory returns:
  - heroes[]
  - skills[]

4.2 Hero item shape
- instanceId
- itemId
- itemType = "hero"
- itemClass = usually "Unit"
- remainingUses
- customData:
  - lv
  - evlove_lv
  - evlove_value

4.3 Skill item shape
- instanceId
- itemId
- itemType = "skill"
- remainingUses
- customData:
  - lv
  - lv_skill

4.4 Hero upgrade
- POST /api/v1/inventory/heroes/:instanceId/upgrade
- Input:
  {
    "configVersion": "2026.05.02.1",
    "idempotencyKey": "..."
  }
- Behavior:
  - checks player owns hero instance
  - reads hero rarity from active hero config
  - reads cost rule from active upgrade config
  - deducts gold + matching shard currency
  - increments hero customData.lv
  - updates quest progress for UPGRADE_UNIT
- Output data:
  - updated hero
  - current currency
  - questUpdates[]

4.5 Hero evolve
- POST /api/v1/inventory/heroes/:instanceId/evolve
- Input:
  {
    "configVersion": "2026.05.02.1",
    "idempotencyKey": "..."
  }
- Behavior:
  - checks player owns hero instance
  - loads evolve rule by itemId + current evlove_lv
  - finds duplicate owned hero copies excluding target instance
  - requires enough duplicates
  - deducts gold + shard currency
  - deletes consumed duplicate hero rows
  - increments customData.evlove_lv on target hero
- Output data:
  - updated hero
  - consumed[] with itemId + quantity
  - current currency

4.6 Skill purchase
- POST /api/v1/inventory/skills/:itemId/purchase
- Input:
  {
    "configVersion": "2026.05.02.1",
    "idempotencyKey": "..."
  }
- Behavior:
  - loads skill purchase rule from active upgrade config
  - deducts configured currency
  - creates skill inventory row
  - sets lv = "1" and lv_skill = "1"
- Output data:
  - skill
  - current currency

4.7 Skill upgrade
- POST /api/v1/inventory/skills/:instanceId/upgrade
- Input:
  {
    "configVersion": "2026.05.02.1",
    "idempotencyKey": "..."
  }
- Behavior:
  - checks player owns skill instance
  - loads skill upgrade rule by itemId + current level
  - deducts configured currency
  - increments both lv and lv_skill
- Output data:
  - updated skill
  - current currency

5. FORMATION MODEL

5.1 GET /api/v1/formation
- Returns:
  {
    "name": "active",
    "slots": [...]
  }

5.2 Slot shape
- slot: integer
- unitName: string
- position:
  - x
  - y
  - z

5.3 PUT /api/v1/formation
- Input:
  {
    "name": "active",
    "slots": [
      {
        "slot": 0,
        "unitName": "Soldier",
        "position": { "x": 0, "y": 0, "z": 0 }
      }
    ]
  }
- Behavior:
  - validates duplicate slot indexes are not allowed
  - validates unitName belongs to player-owned hero inventory
  - upserts named formation
- Output:
  - name
  - slots

6. QUEST MODEL

6.1 Quest categories
- daily
- weekly
- achievement

6.2 GET /api/v1/quests
- Returns:
  - daily.resetAt
  - daily.points
  - daily.quests[]
  - daily.progressRewards[]
  - weekly.resetAt
  - weekly.points
  - weekly.quests[]
  - weekly.progressRewards[]
  - achievement.quests[]

6.3 Quest item fields
- questId
- type
- actionId
- description
- progress
- required
- isCompleted
- rewardClaimed
- rewards[]

6.4 Progress reward fields
- stage
- claimed
- isUnlocked
- reward

6.5 Quest progress actions currently wired
- PLAY_GAME
- WIN_BATTLE
- UPGRADE_UNIT

6.6 Progress update sources
- battle finish increments PLAY_GAME
- battle finish increments WIN_BATTLE when result = WIN
- hero upgrade increments UPGRADE_UNIT

6.7 Claim quest
- POST /api/v1/quests/:questId/claim
- Input:
  {
    "idempotencyKey": "..."
  }
- Behavior:
  - ensures quest state exists for current period
  - checks quest exists
  - checks not already claimed
  - checks progress >= required
  - grants configured rewards
  - if daily/weekly quest has points, increments corresponding track points
- Output data:
  - quest
  - grantedRewards[]
  - currency
  - dailyPoints? or weeklyPoints?

6.8 Claim progress reward
- POST /api/v1/quests/progress-rewards/:track/:stage/claim
- track = daily | weekly
- stage currently seeded as one of 2, 4, 6, 8
- Input:
  {
    "idempotencyKey": "..."
  }
- Behavior:
  - checks progress reward exists for current period
  - checks not already claimed
  - checks reward is unlocked by points >= stage
  - grants reward
- Output data:
  - track
  - stage
  - claimed = true
  - grantedRewards[]
  - currency

7. BATTLE MODEL

7.1 POST /api/v1/battles/start
- Input:
  {
    "mode": "PVP" or "PVE",
    "formationName": "active",
    "configVersion": "2026.05.02.1"
  }
- Behavior:
  - validates configVersion
  - validates formation exists for player
  - if mode = PVP:
    - queries matchmaking candidates
    - picks first returned opponent
    - fails with NOT_FOUND if no opponent exists
  - creates battle session with:
    - battleId
    - playerId
    - opponentPlayerId optional
    - mode
    - random seed
    - status = started
    - startedAt
    - expiresAt = now + 15 minutes
    - configVersion
- Output data:
  - battleId
  - mode
  - seed
  - opponent? with playerId/displayName/avatar/score/formation for PVP
  - configVersion
  - expiresAt

7.2 POST /api/v1/battles/:battleId/finish
- Input:
  {
    "idempotencyKey": "...",
    "result": "WIN" | "LOSE" | "DRAW",
    "durationSec": 1..3600,
    "winCondition": "string",
    "playerPercent": 0..1
  }
- Behavior:
  - checks battle exists and belongs to current player
  - checks status is not already finished
  - checks battle not expired
  - loads reward rule by battle.mode + result
  - applies reward settlement server-side
  - updates quest progress for PLAY_GAME and optional WIN_BATTLE
  - stores summary in battle session
  - marks session finished
  - syncs leaderboard projection after settlement
- Output data:
  - battleId
  - result
  - rewards[]
  - playerDelta
  - currency
  - questUpdates[]

7.3 Important battle caveat
- Battle v1 does NOT do deterministic replay validation or full combat simulation
- The server currently validates session ownership, expiry, status, summary bounds, and then settles rewards from config tables

8. LEADERBOARD AND MATCHMAKING

8.1 Leaderboard types
- score
- level
- campaign

8.2 GET /api/v1/leaderboards/:type
- Query: limit (clamped to 1..100)
- Output data:
  - type
  - entries[] where each entry has:
    - rank
    - playerId
    - displayName
    - avatar
    - score

8.3 GET /api/v1/leaderboards/:type/me
- Output data:
  - type
  - rank
  - score

8.4 GET /api/v1/matchmaking/opponents?mode=PVP
- Output data:
  - opponents[] with:
    - playerId
    - displayName
    - avatar
    - score
    - formation[]
    - units[] where each unit has:
      - itemId
      - level
      - evolveValue
- Current matchmaking behavior:
  - only returns meaningful opponents for PVP
  - for non-PVP mode returns empty list
  - candidates are selected from leaderboard score rows excluding self
  - candidates are sorted by closeness to self score
  - result size is capped to top 5 after gap sorting

9. CONFIG DELIVERY

9.1 GET /api/v1/configs/manifest
- Public endpoint
- Output data:
  - activeVersion
  - configs map by name -> version

9.2 GET /api/v1/configs/:name?version=...
- Public endpoint
- Output data:
  - name
  - version
  - records[]
- If version omitted, server resolves active config for that name

10. SEEDED DEFAULT GAMEPLAY DATA CURRENTLY SHIPPED

10.1 Active version
- 2026.05.02.1

10.2 Hero config
- Soldier
  - itemClass: Unit
  - rarity: normal
  - shardCurrency: normalShard
- Archer
  - itemClass: Unit
  - rarity: normal
  - shardCurrency: normalShard
- Prophet
  - itemClass: Unit
  - rarity: elite
  - shardCurrency: eliteShard

10.3 Starter state for newly bootstrapped player
- New player starts with:
  - 500 gold
  - 0 gem
  - 0 normalShard
  - 0 eliteShard
  - 0 specialShard
- Starter heroes:
  - Soldier
  - Archer
  - Prophet
- Default formation:
  - name = active
  - slots populated from starter heroes
- Default leaderboard projections:
  - score
  - level
  - campaign

10.4 Hero upgrade rules
- Soldier:
  - level 1 -> cost 80 gold, 0 normalShard
  - level 2 -> cost 160 gold, 1 normalShard
  - level 3 -> cost 240 gold, 2 normalShard
- Archer:
  - level 1 -> cost 80 gold, 0 normalShard
  - level 2 -> cost 160 gold, 1 normalShard
  - level 3 -> cost 240 gold, 2 normalShard
- Prophet:
  - level 1 -> cost 100 gold, 0 eliteShard
  - level 2 -> cost 180 gold, 1 eliteShard
  - level 3 -> cost 260 gold, 2 eliteShard

10.5 Hero evolve rules
- Soldier:
  - evolveLevel 1 -> cost 200 gold, 0 normalShard, requires 2 duplicate copies
- Archer:
  - evolveLevel 1 -> cost 200 gold, 0 normalShard, requires 2 duplicate copies
- Prophet:
  - evolveLevel 1 -> cost 300 gold, 1 eliteShard, requires 2 duplicate copies

10.6 Skill purchase rules
- Pray -> costs 10 normalShard
- bombardment -> costs 12 normalShard

10.7 Skill upgrade rules
- Pray:
  - level 1 -> cost 5 normalShard
  - level 2 -> cost 8 normalShard
- bombardment:
  - level 1 -> cost 6 normalShard
  - level 2 -> cost 9 normalShard

10.8 Profile rename rules
- changedNameCount = 0 -> cost 0 gold
- changedNameCount >= 1 -> cost 50 gem

10.9 Account level rules
- level 1 requires 0 exp
- level 2 requires 100 exp and grants 100 gold
- level 3 requires 250 exp and grants 50 gem
- level 4 requires 450 exp and grants 3 normalShard

10.10 Quest definitions
- Daily quest 1:
  - action: PLAY_GAME
  - required: 3
  - reward: 50 gem
  - points: 2
- Daily quest 2:
  - action: WIN_BATTLE
  - required: 1
  - reward: 100 gold
  - points: 2
- Daily quest 3:
  - action: UPGRADE_UNIT
  - required: 1
  - reward: 25 gem
  - points: 2
- Weekly quest 101:
  - action: PLAY_GAME
  - required: 10
  - reward: 100 gem
  - points: 4
- Weekly quest 102:
  - action: UPGRADE_UNIT
  - required: 3
  - reward: 5 normalShard
  - points: 4
- Achievement quest 201:
  - action: WIN_BATTLE
  - required: 3
  - reward: 1 specialShard

10.11 Progress reward definitions
- Daily:
  - stage 2 -> 50 gem
  - stage 4 -> 200 gold
  - stage 6 -> 3 normalShard
  - stage 8 -> 100 gem
- Weekly:
  - stage 2 -> 75 gem
  - stage 4 -> 500 gold
  - stage 6 -> 2 eliteShard
  - stage 8 -> 1 specialShard

10.12 Rank reward definitions
- PVP WIN:
  - 100 gold
  - 20 exp
  - 3 trophy
  - 1 normalShard
- PVP LOSE:
  - 40 gold
  - 10 exp
  - -1 trophy
- PVP DRAW:
  - 50 gold
  - 12 exp
- PVE WIN:
  - 80 gold
  - 15 exp
  - 1 normalShard
- PVE LOSE:
  - 30 gold
  - 5 exp

10.13 Avatar config
- normal
- avatar_01
- avatar_02

11. CHARACTER MODULE COMPATIBILITY NOTE

11.1 Character route group
- Base path: /api/v1/character

11.2 Important difference
- Character feature is legacy-compatible and does NOT use the same success envelope as the newer FotF APIs
- Character success responses still use older result/execution structures
- Auth and guard failures around character still use the newer error envelope

11.3 Character routes currently available
- POST /api/v1/character
- GET /api/v1/character
- DELETE /api/v1/character/:characterId
- PATCH /api/v1/character/:characterId/stats/base

11.4 Character flow summary
- Create/list/update/delete character works
- Character module is operational but conceptually separate from the main FotF player/inventory/battle loop

12. IMPLEMENTATION BOUNDARIES AND NON-GOALS

12.1 Implemented well enough for API/runtime
- player bootstrap
- profile updates with rename cost
- inventory mutation loop
- quest progress and claim loop
- battle session lifecycle
- reward settlement with exp/trophy/level-up reward
- leaderboard projection sync
- matchmaking candidate generation
- config delivery

12.2 Not implemented as a full game simulation
- no deterministic combat replay validation
- no full server-side skill cast simulation
- no deep anti-cheat battle audit beyond current validation
- no campaign progression API beyond statistics fields existing in player state
- no shop/gacha/equipment/guild/social system in this contract pack

12.3 Existing fields that currently exist mainly as state carry, not full feature modules
- levelMap
- wave
- gameCoin
- expBattle
- levelBattle
- levelCastle
- stageCampaign
- lobbyUpgradeSpent

13. IMPORTANT ASSUMPTIONS FOR ANY LLM READING THIS PACK

13.1 Source of truth priority
- Prefer runtime behavior and actual returned JSON over inferred REST conventions
- Prefer this pack + feature docs + swagger pages over generic game-backend assumptions

13.2 Do not invent missing systems
- Do not claim there is a full combat engine if not explicitly shown
- Do not claim there are equipment/gacha/shop APIs unless they are present in code/docs
- Do not assume campaign progression endpoints exist just because stageCampaign is present in player statistics

13.3 Safe way to describe this backend
- "The backend implements a server-authoritative API contract for account auth, player hydration, inventory progression, formation management, quest progression and claims, battle session start/finish settlement, leaderboard, matchmaking, and runtime config retrieval."

13.4 Safe way to describe battle
- "Battle v1 is a server-validated settlement flow driven by stored battle sessions and active reward/config tables, not a full deterministic replay simulator."

13.5 Safe way to describe progression
- "Currency, exp, trophy, quest progress, and leaderboard projections are computed and persisted by the server."

13.6 If there is a conflict between this pack and a generic REST expectation
- Prefer the documented field names and runtime envelope used here
- Remember that many successful POST endpoints currently respond with HTTP 201

END OF FOTF BACKEND LLM CONTEXT PACK
~~~

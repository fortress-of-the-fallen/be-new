# API Portal

Trang này là cổng điều hướng cho contract `/api/v1` hiện tại.

## Base Contract

- Base URL: `/api/v1`
- Protected routes: `Authorization: Bearer <accessToken>`
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
- Config: [/swagger/config](/swagger/config)

## Feature Docs

- Auth: [/docs/auth](/docs/auth)
- Player: [/docs/player](/docs/player)
- Character: [/docs/character](/docs/character)
- Inventory: [/docs/inventory](/docs/inventory)
- Formation: [/docs/formation](/docs/formation)
- Quest: [/docs/quest](/docs/quest)
- Battle: [/docs/battle](/docs/battle)
- Leaderboard: [/docs/leaderboard](/docs/leaderboard)
- Config: [/docs/config](/docs/config)

## Shared References

- API Overview + Error Handling: [/swagger](/swagger)
- Environment Config: [Google Sheet](https://docs.google.com/spreadsheets/d/1gPHUbUbTPOIgvykkxbRK4BGK1JGbZBNVgmBMmJw6ItI/edit?usp=sharing)

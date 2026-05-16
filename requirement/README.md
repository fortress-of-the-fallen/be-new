# FotF Backend Documentation

This folder describes the planned backend API and MongoDB data model for
FotF-Client. It is documentation-only and does not contain implementation code.

## Scope

Backend v1 is designed as a server-authoritative REST JSON service:

- Username and password account registration and login.
- Server-side player state replacing the current ES3-only local save over time.
- MongoDB as the primary database.
- Versioned gameplay configs stored by the backend.
- Server-controlled rewards, currency changes, upgrades, quest claims, and battle rewards.
- Lightweight battle result validation. The server validates a battle session and summary, then computes rewards. It does not run full replay simulation in v1.

## Documents

- [API_SPEC.md](API_SPEC.md): Endpoint contract, request and response examples, and error codes.
- [MONGODB_ERD.md](MONGODB_ERD.md): MongoDB collections, fields, indexes, and relationships.

## Integration Notes For Unity

- The client may keep ES3 as a local cache, but after login the server response is the source of truth.
- The client should send user actions, not final balances. For example, request "upgrade this hero" and let the server deduct gold/shards and return the updated state.
- `NormalShard` is the canonical item id and currency field name. `CommonShard` should only be accepted as a legacy alias during migration.
- Every mutating API should support `idempotencyKey` so retrying a request does not duplicate rewards or resource spending.
- `configVersion` should be included in state-changing requests where gameplay math depends on configs.

## Backend Assumptions

- Base path is `/api/v1`.
- Request and response bodies are JSON.
- Auth uses short-lived access tokens and server-stored refresh tokens.
- Passwords are stored as hashes only.
- Dates are stored and returned as UTC ISO-8601 strings.
- MongoDB ObjectIds may be used internally, but public player ids should use stable string ids such as `p_abc123`.

# Fortress of the Fallen Backend

Backend NestJS cho Fortress of the Fallen.

## Mục tiêu của repo

Repo này cung cấp:
- API game dưới `/api/v1`
- Swagger docs theo từng feature
- Portal docs tại `/`
- runtime dependencies cho demo: MongoDB, Redis, MinIO

## Quick start

### 1) Chuẩn bị env

```bash
cp .env.example .env
```

### 2) Chạy dependencies local

```bash
cd docker
docker compose up -d mongo mongo-rs-init redis minio mc-init
cd ..
```

### 3) Cài package và generate Prisma client

```bash
npm install
npm run prisma:generate
```

### 4) Chạy backend

```bash
npm run dev
```

## Chạy bằng Docker demo runtime

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Các URL quan trọng

- API Portal: `http://127.0.0.1:3000/`
- Swagger: `http://127.0.0.1:3000/swagger`
- Public smoke endpoint: `http://127.0.0.1:3000/api/v1/configs/manifest`

## Smoke check nhanh

```bash
curl -i http://127.0.0.1:3000/api/v1/configs/manifest
curl -I http://127.0.0.1:3000/
curl -I http://127.0.0.1:3000/swagger
```

## Log / restart / recovery

Xem runbook chi tiết tại:
- [`/docs/operations`](http://127.0.0.1:3000/docs/operations) khi app đang chạy
- file nguồn markdown: `src/features/operations/application/docs.md`

Các lệnh hay dùng:

```bash
# xem log backend docker
docker compose -f docker-compose.prod.yml logs web --tail=200

# restart backend
docker compose -f docker-compose.prod.yml restart web

# dừng stack demo
docker compose -f docker-compose.prod.yml down
```

## Tài liệu liên quan

- API Portal source: `assets/md/swagger-home.md`
- Auth docs: `src/features/auth/application/docs.md`
- Player docs: `src/features/player/application/docs.md`
- Operations docs: `src/features/operations/application/docs.md`
- GDD / domain docs: `game-design-docs/`
- Test coverage baseline (issue #4): [`docs/test-coverage-baseline.md`](docs/test-coverage-baseline.md)

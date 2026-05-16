# ================================================
# Stage 1: Builder
FROM node:22-bullseye-slim AS builder

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . .

RUN rm -rf dist && npx prisma generate --generator client && npm run build

# ================================================
# Stage 2: Production
FROM node:22-bullseye-slim

WORKDIR /usr/src/app
COPY package*.json ./

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/assets ./assets
COPY --from=builder /usr/src/app/src ./src

CMD ["sh", "-c", "if [ -f dist/src/main.js ]; then node dist/src/main.js; elif [ -f dist/main.js ]; then node dist/main.js; else echo 'main entry not found in dist/' && ls -la dist && exit 1; fi"]

.PHONY: run-dev

install:
	@npm install
	@npm install -g dotenv-cli

lint:
	@npm run lint
	npx tsc --noEmit
	@npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"
	npm run test --if-present

run:
	@npx copyfiles -u 1 "./assets/**/*" dist/assets
	@npx dotenv -e .env -- npm run start:debug

up:
	@docker-compose -f docker/docker-compose.yaml --env-file docker/.env -p stream_za up -d

down:
	@docker-compose -f docker/docker-compose.yaml --env-file docker/.env -p stream_za down


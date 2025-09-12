npx copyfiles -u 1 "./assets/**/*" dist/assets
npx dotenv -e .env -- npm run start:debug
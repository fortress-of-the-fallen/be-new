import { INestApplication } from '@nestjs/common';
import { join } from 'path';
import { renderMarkdownPage } from './markdown.renderer';

export function registerDocsRoutes(app: INestApplication): void {
   const expressApp = app.getHttpAdapter().getInstance();
   const docsPages = [
      {
         route: '/docs/auth',
         title: 'Auth Docs',
         markdownPath: join(process.cwd(), 'src/features/auth/application/docs.md'),
      },
      {
         route: '/docs/character',
         title: 'Character Docs',
         markdownPath: join(process.cwd(), 'src/features/character/application/docs.md'),
      },
      {
         route: '/docs/player',
         title: 'Player Docs',
         markdownPath: join(process.cwd(), 'src/features/player/application/docs.md'),
      },
      {
         route: '/docs/inventory',
         title: 'Inventory Docs',
         markdownPath: join(process.cwd(), 'src/features/inventory/application/docs.md'),
      },
      {
         route: '/docs/formation',
         title: 'Formation Docs',
         markdownPath: join(process.cwd(), 'src/features/formation/application/docs.md'),
      },
      {
         route: '/docs/quest',
         title: 'Quest Docs',
         markdownPath: join(process.cwd(), 'src/features/quest/application/docs.md'),
      },
      {
         route: '/docs/battle',
         title: 'Battle Docs',
         markdownPath: join(process.cwd(), 'src/features/battle/application/docs.md'),
      },
      {
         route: '/docs/leaderboard',
         title: 'Leaderboard Docs',
         markdownPath: join(process.cwd(), 'src/features/leaderboard/application/docs.md'),
      },
      {
         route: '/docs/config',
         title: 'Config Docs',
         markdownPath: join(process.cwd(), 'src/features/config/application/docs.md'),
      },
      {
         route: '/docs/lobby',
         title: 'Lobby Docs',
         markdownPath: join(process.cwd(), 'src/features/lobby/application/docs.md'),
      },
      {
         route: '/docs/shop',
         title: 'Shop Docs',
         markdownPath: join(process.cwd(), 'src/features/shop/application/docs.md'),
      },
      {
         route: '/docs/operations',
         title: 'Operations Docs',
         markdownPath: join(process.cwd(), 'src/features/operations/application/docs.md'),
      },
   ] as const;

   expressApp.get('/', async (_req: any, res: any) => {
      await renderMarkdownPage(res, {
         title: 'API Portal',
         markdownPath: join(process.cwd(), 'assets/md/swagger-home.md'),
      });
   });

   for (const page of docsPages) {
      expressApp.get(page.route, async (_req: any, res: any) => {
         await renderMarkdownPage(res, {
            title: page.title,
            markdownPath: page.markdownPath,
         });
      });
   }

   expressApp.get('/docs-icon.svg', (_req: any, res: any) => {
      res.type('image/svg+xml').sendFile(join(process.cwd(), 'assets/icons/docs-heroicon.svg'));
   });
}

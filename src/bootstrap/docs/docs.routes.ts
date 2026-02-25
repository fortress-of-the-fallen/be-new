import { INestApplication } from '@nestjs/common';
import { join } from 'path';
import { renderMarkdownPage } from './markdown.renderer';

export function registerDocsRoutes(app: INestApplication): void {
   const expressApp = app.getHttpAdapter().getInstance();

   expressApp.get('/', async (_req: any, res: any) => {
      await renderMarkdownPage(res, {
         title: 'API Portal',
         markdownPath: join(process.cwd(), 'assets/md/swagger-home.md'),
      });
   });

   expressApp.get('/docs/auth', async (_req: any, res: any) => {
      await renderMarkdownPage(res, {
         title: 'Auth Docs',
         markdownPath: join(process.cwd(), 'src/features/auth/application/docs.md'),
      });
   });

   expressApp.get('/docs/character', async (_req: any, res: any) => {
      await renderMarkdownPage(res, {
         title: 'Character Docs',
         markdownPath: join(process.cwd(), 'src/features/character/application/docs.md'),
      });
   });

   expressApp.get('/docs-icon.svg', (_req: any, res: any) => {
      res.type('image/svg+xml').sendFile(join(process.cwd(), 'assets/icons/docs-heroicon.svg'));
   });
}

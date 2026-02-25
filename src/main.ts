import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { GlobalInterceptor } from 'src/api/interceptor/global.interceptor';
import { HttpExceptionFilter } from 'src/api/filter/http-exception.filter';
import { join } from 'path';
import { marked } from 'marked';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigKeyConstant } from './shared/constant/configkey.constant';
import rateLimit from 'express-rate-limit';
import { ValidateException } from './shared/exception/validate-exception';
import { ReqValidateFilter } from './api/filter/req-validate.filter';
import { AllExceptionFilter } from './api/filter/all-exception.filter';
import { Seeding } from './infrastructure/persistence/seeding/seeding';

async function bootstrap() {
   const bootstrapLogger = new Logger('Main');
   clearOldLogsIfDev();

   const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
   });

   const seeding = await app.resolve(Seeding);
   await seeding.seed();

   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         forbidNonWhitelisted: true,
         transform: true,
         exceptionFactory: errors => {
            const messages = errors.flatMap(e => Object.values(e.constraints || {}));
            return new ValidateException('Validation failed', messages);
         },
      }),
   );

   app.use(
      rateLimit({
         windowMs: 1 * 60 * 1000, // 1 minute
         max: 50, // Limit each IP to 50 requests per windowMs
         message: 'Too many requests from this IP, please try again later.',
         standardHeaders: true,
         legacyHeaders: false,
      }),
   );

   bootstrapLogger.log('Application is starting..., NODE_ENV: ' + ConfigKeyConstant.NodeEnv);

   app.enableVersioning({
      type: VersioningType.URI,
   });

   const globalInterceptor = await app.resolve(GlobalInterceptor);
   app.useGlobalInterceptors(globalInterceptor);

   app.useGlobalFilters(new AllExceptionFilter(new HttpExceptionFilter(), new ReqValidateFilter()));

   const config = new DocumentBuilder()
      .setTitle('API Docs')
      .setDescription(
         await convertMarkdownToHtml(join(process.cwd(), ConfigKeyConstant.SwaggerDescriptionPath)),
      )
      .setVersion('1.0')
      .addApiKey(
         {
            type: 'apiKey',
            name: 'session-id',
            in: 'header',
         },
         'session',
      )
      .build();

   const document = SwaggerModule.createDocument(app, config);

   const swaggerUiOptions = {
      swaggerOptions: {
         displayRequestDuration: true,
         filter: true,
         defaultModelsExpandDepth: -1,
         tagsSorter: 'alpha',
         persistAuthorization: true,
      },
   };

   SwaggerModule.setup('swagger', app, document, {
      ...swaggerUiOptions,
      customSiteTitle: 'Swagger Docs - All',
   });

   SwaggerModule.setup('swagger/auth', app, filterDocumentByTags(document, ['Auth']), {
      ...swaggerUiOptions,
      customSiteTitle: 'Swagger Docs - Auth',
   });

   SwaggerModule.setup(
      'swagger/character',
      app,
      filterDocumentByTags(document, ['Character']),
      {
         ...swaggerUiOptions,
         customSiteTitle: 'Swagger Docs - Character',
      },
   );

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

   await app.listen(ConfigKeyConstant.ServerPort);
}

bootstrap().catch(err => {
   console.error('Fail to start application:', err.message);
});

async function convertMarkdownToHtml(filePath: string): Promise<string> {
   const mdContent = fs.readFileSync(path.resolve(filePath), 'utf-8');
   const html = await marked(mdContent);
   return html;
}

async function renderMarkdownPage(
   res: any,
   options: { title: string; markdownPath: string },
): Promise<void> {
   try {
      const html = withLinksOpenInNewTab(await convertMarkdownToHtml(options.markdownPath));
      res.type('html').send(buildHtmlPage(options.title, html));
   } catch (error) {
      res.status(500).type('text/plain').send(`Cannot render markdown: ${options.markdownPath}`);
   }
}

function withLinksOpenInNewTab(html: string): string {
   return html.replace(/<a\s+href=/g, '<a target="_blank" rel="noopener noreferrer" href=');
}

function buildHtmlPage(title: string, bodyHtml: string): string {
   return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/docs-icon.svg" />
    <title>${title}</title>
    <style>
      :root {
        --bg-from: #f7fafc;
        --bg-to: #eef3f8;
        --surface: #ffffff;
        --border: #d7e2ee;
        --text: #111827;
        --muted: #334155;
        --heading: #10243f;
        --link: #0c5db8;
        --link-hover: #0a478c;
        --accent-blue-soft: #edf4ff;
        --accent-blue-mid: #9ec0f3;
        --accent-indigo-soft: #eef0ff;
        --accent-indigo-mid: #aeb8f7;
        --accent-teal-soft: #eaf8f6;
        --accent-teal-mid: #9fded2;
        --code-bg: #edf4ff;
        --code-border: #cddcf5;
        --code-text: #15366a;
        --pre-bg: #0f1726;
        --pre-border: #273449;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: var(--text);
        font: 17px/1.75 "Inter", "Segoe UI", Arial, sans-serif;
        background: linear-gradient(180deg, var(--bg-from) 0%, var(--bg-to) 100%);
      }
      .container { max-width: 920px; margin: 28px auto; padding: 0 18px; }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 30px 34px;
        box-shadow: 0 8px 28px rgba(15, 23, 42, 0.07);
        overflow: hidden;
      }
      h1, h2, h3 { line-height: 1.28; margin: 0 0 12px; color: var(--heading); }
      h1 { font-size: 2.1rem; margin-bottom: 14px; }
      h2 {
        font-size: 1.45rem;
        margin-top: 28px;
        padding-top: 8px;
        border-top: 1px solid var(--border);
      }
      h2:nth-of-type(3n+1) { color: #12335f; }
      h2:nth-of-type(3n+2) { color: #2d2f66; }
      h2:nth-of-type(3n+3) { color: #1f4b55; }
      h3 { font-size: 1.18rem; margin-top: 20px; }
      p { margin: 0 0 14px; color: var(--muted); }
      strong { color: #1e293b; }
      a { color: var(--link); text-decoration: none; font-weight: 600; }
      a:hover { color: var(--link-hover); text-decoration: underline; }
      ul, ol { padding-left: 24px; margin: 0 0 14px; }
      li { margin: 6px 0; color: var(--muted); }
      code {
        background: var(--code-bg);
        border: 1px solid var(--code-border);
        border-radius: 6px;
        padding: 0.12rem 0.4rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.88em;
        color: var(--code-text);
      }
      pre {
        margin: 14px 0 16px;
        padding: 14px 16px;
        border: 1px solid var(--pre-border);
        border-radius: 12px;
        background: var(--pre-bg);
        color: #e6edf8;
        overflow-x: auto;
        max-width: 100%;
        white-space: pre;
        line-height: 1.55;
      }
      pre code {
        background: transparent;
        border: 0;
        color: inherit;
        padding: 0;
        white-space: inherit;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        display: block;
        overflow-x: auto;
        max-width: 100%;
        margin: 12px 0 16px;
        border-radius: 10px;
      }
      th, td {
        border: 1px solid var(--border);
        text-align: left;
        padding: 10px 13px;
        white-space: nowrap;
      }
      th {
        background: var(--accent-indigo-soft);
        color: var(--heading);
      }
      blockquote {
        margin: 12px 0;
        padding: 10px 14px;
        border-left: 4px solid var(--accent-teal-mid);
        background: var(--accent-teal-soft);
        color: #334155;
      }
      details.route-item {
        border: 1px solid var(--border);
        border-radius: 12px;
        background: #fbfdff;
        margin: 12px 0;
        overflow: hidden;
      }
      details.route-item:nth-of-type(3n+1) > summary {
        background: var(--accent-blue-soft);
      }
      details.route-item:nth-of-type(3n+2) > summary {
        background: var(--accent-indigo-soft);
      }
      details.route-item:nth-of-type(3n+3) > summary {
        background: var(--accent-teal-soft);
      }
      details.route-item > summary {
        list-style: none;
        cursor: pointer;
        padding: 12px 14px;
        color: var(--heading);
        font-weight: 700;
        border-bottom: 1px solid var(--border);
      }
      details.route-item > summary::-webkit-details-marker { display: none; }
      details.route-item > summary::after {
        content: "▾";
        float: right;
        transition: transform 0.2s ease;
      }
      details.route-item:not([open]) > summary::after { transform: rotate(-90deg); }
      details.route-item .route-content {
        padding: 12px 14px 6px;
      }
      .card details > summary {
        cursor: pointer;
        transition: background-color 0.18s ease, color 0.18s ease;
      }
      .card details > summary:hover {
        background: #edf4ff;
        color: var(--link-hover);
      }
      .card details > summary:hover code {
        background: #dbeafe;
        border-color: #bfdbfe;
      }
      hr {
        border: 0;
        border-top: 1px solid var(--border);
        margin: 18px 0;
      }
      img { max-width: 100%; height: auto; }
      @media (max-width: 768px) {
        body { font-size: 16px; }
        .container { margin: 16px auto; padding: 0 10px; }
        .card { padding: 18px 16px; border-radius: 12px; }
        h1 { font-size: 1.7rem; }
        h2 { font-size: 1.25rem; }
      }
    </style>
  </head>
  <body>
    <main class="container">
      <section class="card">${bodyHtml}</section>
    </main>
    <script>
      (function () {
        const routeHeaders = Array.from(document.querySelectorAll('.card h3'));
        routeHeaders.forEach((header) => {
          const details = document.createElement('details');
          details.className = 'route-item';

          const summary = document.createElement('summary');
          summary.innerHTML = header.innerHTML;
          details.appendChild(summary);

          const content = document.createElement('div');
          content.className = 'route-content';

          let node = header.nextElementSibling;
          while (node && node.tagName !== 'H3' && node.tagName !== 'H2') {
            const next = node.nextElementSibling;
            content.appendChild(node);
            node = next;
          }

          details.appendChild(content);
          header.replaceWith(details);
        });
      })();
    </script>
  </body>
</html>`;
}

// Delete old log files in the logs directory when running in the DEV environment
function clearOldLogsIfDev() {
   if (process.env.NODE_ENV === 'development') {
      const logDir = path.join(__dirname, '..', 'logs');

      if (fs.existsSync(logDir)) {
         fs.readdirSync(logDir).forEach(file => {
            const filePath = path.join(logDir, file);
            fs.unlinkSync(filePath);
         });

         console.log('Old logs have been deleted in DEV environment');
      }
   }
}

function filterDocumentByTags(document: any, allowedTags: string[]): any {
   const allowed = new Set(allowedTags);
   const allowedMethods = new Set([
      'get',
      'post',
      'put',
      'delete',
      'patch',
      'head',
      'options',
      'trace',
   ]);

   const filteredPaths: Record<string, any> = {};

   for (const [pathKey, pathItem] of Object.entries(document.paths || {})) {
      const currentPath = pathItem as Record<string, any>;
      const nextPathItem: Record<string, any> = {};

      for (const [method, operation] of Object.entries(currentPath)) {
         if (!allowedMethods.has(method)) {
            continue;
         }

         const operationTags: string[] = Array.isArray((operation as any).tags)
            ? (operation as any).tags
            : [];

         if (operationTags.some(tag => allowed.has(tag))) {
            nextPathItem[method] = operation;
         }
      }

      if (Object.keys(nextPathItem).length > 0) {
         filteredPaths[pathKey] = nextPathItem;
      }
   }

   return {
      ...document,
      paths: filteredPaths,
      tags: (document.tags || []).filter((tag: any) => allowed.has(tag.name)),
   };
}

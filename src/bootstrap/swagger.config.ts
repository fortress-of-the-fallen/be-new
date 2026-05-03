import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { ConfigKeyConstant } from 'src/shared/constant/configkey.constant';
import { convertMarkdownToHtml } from './docs/markdown.renderer';

export async function setupSwagger(app: INestApplication): Promise<void> {
   const config = new DocumentBuilder()
      .setTitle('API Docs')
      .setDescription(
         await convertMarkdownToHtml(join(process.cwd(), ConfigKeyConstant.SwaggerDescriptionPath)),
      )
      .setVersion('1.0')
      .addBearerAuth(
         {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'Authorization',
            description: 'Bearer access token',
            in: 'header',
         },
         'access-token',
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

   const featureTags = [
      'Player',
      'Inventory',
      'Formation',
      'Quest',
      'Battle',
      'Leaderboard',
      'Config',
   ];

   for (const tag of featureTags) {
      SwaggerModule.setup(
         `swagger/${tag.toLowerCase()}`,
         app,
         filterDocumentByTags(document, [tag]),
         {
            ...swaggerUiOptions,
            customSiteTitle: `Swagger Docs - ${tag}`,
         },
      );
   }
}

function filterDocumentByTags(document: OpenAPIObject, allowedTags: string[]): OpenAPIObject {
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
      tags: (document.tags || []).filter(tag => allowed.has(tag.name)),
   };
}

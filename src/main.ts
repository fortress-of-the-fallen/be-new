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

   SwaggerModule.setup('', app, document, {
      swaggerOptions: {
         displayRequestDuration: true,
         filter: true,
         defaultModelsExpandDepth: -1,
         tagsSorter: 'alpha',
         persistAuthorization: true,
      },
      customSiteTitle: 'Swagger Docs',
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

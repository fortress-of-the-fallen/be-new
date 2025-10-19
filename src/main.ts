import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { GlobalInterceptor } from 'src/presentation/interceptor/global.interceptor';
import { HttpExceptionFilter } from 'src/presentation/filter/http-exception.filter';
import { join } from 'path';
import { marked } from 'marked';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigKeyConstant } from './domain/constant/configkey.constant';
import { ILogger } from './application/interface/logger/i-logger';
import rateLimit from 'express-rate-limit';
import { ValidateException } from './domain/exception/validate-exception';
import { ReqValidateFilter } from './presentation/filter/req-validate.filter';
import { AllExceptionFilter } from './presentation/filter/all-exception.filter';
import { Seeding } from './infrastructure/data-access/seeding/seeding';

async function bootstrap() {
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

   const logger: ILogger = await app.resolve(ILogger);
   logger.setContext('Main');
   logger.log('Application is starting..., NODE_ENV: ' + ConfigKeyConstant.NodeEnv);
   app.useLogger(logger);

   app.enableVersioning({
      type: VersioningType.URI,
   });

   const globalInterceptor = await app.resolve(GlobalInterceptor);
   const interceptorLogger: ILogger = await app.resolve(ILogger);
   interceptorLogger.setContext('GlobalInterceptor');
   app.useGlobalInterceptors(globalInterceptor);

   const httpExceptionFilter: ILogger = await app.resolve(ILogger);
   const validateFilter: ILogger = await app.resolve(ILogger);
   const allExceptionFilter: ILogger = await app.resolve(ILogger);

   app.useGlobalFilters(
      new AllExceptionFilter(
         allExceptionFilter,
         new HttpExceptionFilter(httpExceptionFilter),
         new ReqValidateFilter(validateFilter),
      ),
   );

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

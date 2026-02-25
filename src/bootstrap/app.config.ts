import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import { ReqValidateFilter } from 'src/api/filter/req-validate.filter';
import { HttpExceptionFilter } from 'src/api/filter/http-exception.filter';
import { AllExceptionFilter } from 'src/api/filter/all-exception.filter';
import { GlobalInterceptor } from 'src/api/interceptor/global.interceptor';
import { ValidateException } from 'src/shared/exception/validate-exception';

export async function configureApp(app: INestApplication): Promise<void> {
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

   app.enableVersioning({
      type: VersioningType.URI,
   });

   const globalInterceptor = await app.resolve(GlobalInterceptor);
   app.useGlobalInterceptors(globalInterceptor);

   app.useGlobalFilters(new AllExceptionFilter(new HttpExceptionFilter(), new ReqValidateFilter()));
}

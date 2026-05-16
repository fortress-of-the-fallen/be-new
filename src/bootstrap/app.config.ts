import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import rateLimit from 'express-rate-limit';
import { ApiErrorCode } from 'src/api/api-error-code';
import { ReqValidateFilter } from 'src/api/filter/req-validate.filter';
import { HttpExceptionFilter } from 'src/api/filter/http-exception.filter';
import { AllExceptionFilter } from 'src/api/filter/all-exception.filter';
import { GlobalInterceptor } from 'src/api/interceptor/global.interceptor';
import { ValidateException } from 'src/shared/exception/validate-exception';

export function buildValidationException(errors: ValidationError[]): ValidateException {
   const messages = errors.flatMap(error => collectValidationMessages(error));
   const configVersionError = findConfigVersionError(errors);

   if (
      configVersionError &&
      (configVersionError.value === undefined ||
         configVersionError.value === null ||
         configVersionError.value === '')
   ) {
      return new ValidateException(
         'configVersion is required',
         messages,
         ApiErrorCode.ConfigVersionMissing,
      );
   }

   return new ValidateException('Validation failed', messages);
}

function collectValidationMessages(error: ValidationError): string[] {
   const currentMessages = Object.values(error.constraints ?? {});
   const childMessages = (error.children ?? []).flatMap(child => collectValidationMessages(child));
   return [...currentMessages, ...childMessages];
}

function findConfigVersionError(errors: ValidationError[]): ValidationError | undefined {
   for (const error of errors) {
      if (error.property === 'configVersion') {
         return error;
      }

      const childMatch = findConfigVersionError(error.children ?? []);
      if (childMatch) {
         return childMatch;
      }
   }

   return undefined;
}

export async function configureApp(app: INestApplication): Promise<void> {
   app.setGlobalPrefix('api');

   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         forbidNonWhitelisted: true,
         transform: true,
         exceptionFactory: errors => {
            return buildValidationException(errors);
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

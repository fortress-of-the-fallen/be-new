import { Logger } from '@nestjs/common';
import { configureApp } from 'src/bootstrap/app.config';
import { createApp } from 'src/bootstrap/app.factory';
import { registerDocsRoutes } from 'src/bootstrap/docs/docs.routes';
import { clearOldLogsIfDev } from 'src/bootstrap/logging/log-cleanup';
import { setupSwagger } from 'src/bootstrap/swagger.config';
import { ConfigKeyConstant } from 'src/shared/constant/configkey.constant';

async function bootstrap() {
   const bootstrapLogger = new Logger('Main');
   clearOldLogsIfDev();

   const app = await createApp();
   await configureApp(app);
   await setupSwagger(app);
   registerDocsRoutes(app);

   bootstrapLogger.log('Application is starting..., NODE_ENV: ' + ConfigKeyConstant.NodeEnv);
   await app.listen(ConfigKeyConstant.ServerPort);
}

bootstrap().catch(err => {
   console.error('Fail to start application:', err.message);
});

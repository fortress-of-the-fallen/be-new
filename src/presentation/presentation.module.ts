import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ControllerModule } from './controller/controller.module';
import { GlobalInterceptor } from './interceptor/global.interceptor';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { HeaderCheckMiddleware } from './middleware/header-check.middleware';

@Module({
   imports: [ControllerModule, InfrastructureModule],
   providers: [GlobalInterceptor],
   exports: [ControllerModule, GlobalInterceptor],
})
export class PresentationModule {
   configure(consumer: MiddlewareConsumer) {
      consumer.apply(HeaderCheckMiddleware).forRoutes('*');
   }
}

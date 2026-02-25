import { Module } from '@nestjs/common';
import { ControllerModule } from './controller/controller.module';
import { GlobalInterceptor } from './interceptor/global.interceptor';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
   imports: [ControllerModule, InfrastructureModule],
   providers: [GlobalInterceptor],
   exports: [ControllerModule, GlobalInterceptor],
})
export class ApiModule {}

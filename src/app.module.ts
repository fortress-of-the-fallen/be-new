import { Module } from '@nestjs/common';
import { PresentationModule } from './presentation/presentation.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { MediatorModule } from './infrastructure/mediator/mediator.module';
import { MappingModule } from './infrastructure/mapper/mapper.module';

@Module({
   imports: [
      PresentationModule,
      InfrastructureModule,
      MediatorModule.register(),
      MappingModule.register(),
   ],
})
export class AppModule {}

import { DynamicModule, forwardRef, Module, Scope } from '@nestjs/common';
import { Mediator } from './mediator';
import { IMediator } from 'src/application/interface/mediator/i-mediator';
import { InfrastructureModule } from '../infrastructure.module';
import { RegisteredHandlers } from 'src/domain/decorator/request-handler.decorator';

@Module({
   imports: [forwardRef(() => InfrastructureModule)],
   providers: [
      {
         provide: IMediator,
         useClass: Mediator,
         scope: Scope.REQUEST,
      },
   ],
   exports: [IMediator],
})
export class MediatorModule {
   static register(): DynamicModule {
      return {
         module: MediatorModule,
         providers: [
            Mediator,
            {
               provide: IMediator,
               useExisting: Mediator,
               scope: Scope.REQUEST,
            },
            ...RegisteredHandlers.map(handler => {
               const requestType = Reflect.getMetadata('requestType', handler);

               return {
                  provide: requestType,
                  useClass: handler,
               };
            }),
         ],
         exports: [IMediator],
      };
   }
}

import { Injectable, Scope } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IMediator } from 'src/application/interface/mediator/i-mediator';
import { IRequest } from 'src/application/interface/mediator/i-request';
import 'reflect-metadata';

@Injectable({ scope: Scope.REQUEST })
export class Mediator implements IMediator {
   constructor(private readonly moduleRef: ModuleRef) {}

   async send<TResponse>(request: IRequest<TResponse>): Promise<TResponse> {
      const token = request.constructor;
      const handler = await this.moduleRef.resolve(token, undefined, { strict: false });

      if (!handler) throw new Error(`Handler not found for ${token}`);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return handler.handle(request as any);
   }
}

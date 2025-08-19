import { IBaseReadRepository } from 'src/application/interface/data-access/base-data-access/repository/i-base-read.repository';
import { IBaseEntity } from 'src/domain/entity/base/i-base.entity';
import { Model } from 'mongoose';
import { ReadRepository } from '../repository/read.repository';
import { IBaseReadUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-read.unit-of-work';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { ModuleRef } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { ICacheManager } from 'src/application/interface/cache-manager/i-cache-manager';

@Injectable({ scope: Scope.REQUEST })
class ReadUnitOfWork implements IBaseReadUnitOfWork {
   protected repositories = new Map<string, IBaseReadRepository<any>>();

   constructor(
      protected moduleRef: ModuleRef,
      @Inject(ILogger) protected readonly logger: ILogger,
      @Inject(ICacheManager) protected readonly cacheManager: ICacheManager,
   ) {}

   getRepository<T extends IBaseEntity>(name: string): ReadRepository<T> {
      const model = this.moduleRef.get<Model<T>>(getModelToken(name), { strict: false });
      if (!this.repositories.has(name)) {
         this.repositories.set(name, new ReadRepository<T>(model, this.cacheManager));
      }
      return this.repositories.get(name) as ReadRepository<T>;
   }
}

export { ReadUnitOfWork };

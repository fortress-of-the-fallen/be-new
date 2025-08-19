import { IBaseEntity } from 'src/domain/entity/base/i-base.entity';
import { IBaseReadRepository } from '../repository/i-base-read.repository';

export interface IBaseReadUnitOfWork {
   getRepository<T extends IBaseEntity>(name: string): IBaseReadRepository<T>;
}

export const IBaseReadUnitOfWork = Symbol('IBaseReadUnitOfWork');

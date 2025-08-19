import { IBaseEntity } from 'src/domain/entity/base/i-base.entity';
import { IUniReadRepository } from '../repository/i-uni-read.repository';

export interface IUniReadUnitOfWork {
   getRepository<T extends IBaseEntity>(name: string): IUniReadRepository<T>;
}

export const IUniReadUnitOfWork = Symbol('IUniReadUnitOfWork');

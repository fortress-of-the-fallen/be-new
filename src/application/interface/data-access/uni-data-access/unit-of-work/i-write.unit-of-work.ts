import { IBaseEntity } from 'src/domain/entity/base/i-base.entity';
import { IUniWriteRepository } from '../repository/i-uni-write.repository';

export interface IUniWriteUnitOfWork {
   getRepository<T extends IBaseEntity>(name: string): IUniWriteRepository<T>;
   saveChanges(): Promise<void>;
}

export const IUniWriteUnitOfWork = Symbol('IUniWriteUnitOfWork');

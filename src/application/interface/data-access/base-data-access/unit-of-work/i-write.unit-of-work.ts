import { IBaseEntity } from 'src/domain/entity/base/i-base.entity';
import { IBaseWriteRepository } from '../repository/i-base-write.repository';

export interface IBaseWriteUnitOfWork {
   getRepository<T extends IBaseEntity>(name: string): IBaseWriteRepository<T>;
   saveChanges(): Promise<void>;
}

export const IBaseWriteUnitOfWork = Symbol('IBaseWriteUnitOfWork');

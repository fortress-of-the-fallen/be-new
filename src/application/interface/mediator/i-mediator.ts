import { IRequest, IRequestHandler } from './i-request';

export interface IMediator {
   send<T>(command: any): Promise<T>;
}

export const IMediator = Symbol('IMediator');

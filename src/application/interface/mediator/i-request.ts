// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IRequest<TResponse = any> {}

export interface IRequestHandler<TRequest extends IRequest<TResponse>, TResponse> {
   handle(request: TRequest): Promise<TResponse> | TResponse;
}

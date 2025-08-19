import { Inject, Injectable, Scope } from '@nestjs/common';
import { IBaseWriteUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-write.unit-of-work';
import { IHttpContextAccessor } from 'src/application/interface/http/i-http-context-accessor';
import { Session } from 'src/domain/entity/session.entity';
import { AuthControllerMessage } from 'src/domain/message/auth-controller.message';
import { Request as ExpressRequest } from 'express';
import { IRequest, IRequestHandler } from 'src/application/interface/mediator/i-request';
import { RequestHandler } from 'src/domain/decorator/request-handler.decorator';

export class LogoutCommand implements IRequest<string> {}

@RequestHandler(LogoutCommand)
export class LogoutCommandHandler implements IRequestHandler<LogoutCommand, string> {
   constructor(
      @Inject(IBaseWriteUnitOfWork)
      private readonly unitOfWork: IBaseWriteUnitOfWork,

      @Inject(IHttpContextAccessor)
      private readonly httpContextAccessor: IHttpContextAccessor,
   ) {}
   async handle(data: LogoutCommand): Promise<string> {
      const httpContext = this.httpContextAccessor.get<ExpressRequest>();
      const sessionId = httpContext?.headers['session-id'] as string;

      if (!sessionId) {
         return AuthControllerMessage.Logout.SESSION_ID_REQUIRED;
      }

      const sessionRepository = this.unitOfWork.getRepository<Session>(Session.name);
      const sessions = await sessionRepository
         .queryCondition({ _id: sessionId })
         .join('user')
         .exec();

      const session = sessions[0];
      if (!session) {
         return AuthControllerMessage.Logout.SESSION_NOT_FOUND;
      }

      await sessionRepository.hardDelete(session._id);
      await this.unitOfWork.saveChanges();

      return '';
   }
}

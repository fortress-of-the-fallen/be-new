import { Inject } from '@nestjs/common';
import { IBaseWriteUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-write.unit-of-work';
import { IHttpContextAccessor } from 'src/application/interface/http/i-http-context-accessor';
import { GameUser } from 'src/domain/entity/game-user.entity';
import { Session } from 'src/domain/entity/session.entity';
import { GameUserControllerMessage } from 'src/domain/message/game-user-controller.message';
import { IRequest, IRequestHandler } from 'src/application/interface/mediator/i-request';
import { RequestHandler } from 'src/domain/decorator/request-handler.decorator';
import { Request as ExpressRequest } from 'express';

export class ListGameUserCommand implements IRequest<[string, GameUser[]]> { }

@RequestHandler(ListGameUserCommand)
export class ListGameUserCommandHandler implements IRequestHandler<ListGameUserCommand, [string, GameUser[]]> {
    constructor(
        @Inject(IBaseWriteUnitOfWork)
        private readonly unitOfWork: IBaseWriteUnitOfWork,

        @Inject(IHttpContextAccessor)
        private readonly httpContextAccessor: IHttpContextAccessor,
    ) { }

    async handle(data: ListGameUserCommand): Promise<[string, GameUser[]]> {
        const httpContext = this.httpContextAccessor.get<ExpressRequest>();
        const sessionId = httpContext?.headers['session-id'] as string;

        if (!sessionId) {
            return [GameUserControllerMessage.List.USER_NOT_FOUND, []];
        }

        const sessionRepository = this.unitOfWork.getRepository<Session>(Session.name);
        const sessions = await sessionRepository
            .queryCondition({ _id: sessionId })
            .join('user')
            .exec();

        const session = sessions[0];
        if (!session) {
            return [GameUserControllerMessage.List.USER_NOT_FOUND, []];
        }

        const userId = typeof session.user === 'string' ? session.user : (session.user as any)._id;

        const gameUserRepository = this.unitOfWork.getRepository<GameUser>(GameUser.name);
        const gameUsers = await gameUserRepository
            .queryCondition({ userId: userId })
            .exec();

        return ['', gameUsers];
    }
}

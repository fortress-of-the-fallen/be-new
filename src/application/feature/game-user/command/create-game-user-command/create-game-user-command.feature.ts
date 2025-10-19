import { Inject } from '@nestjs/common';
import { IBaseWriteUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-write.unit-of-work';
import { IHttpContextAccessor } from 'src/application/interface/http/i-http-context-accessor';
import { User } from 'src/domain/entity/user.entity';
import { GameUser } from 'src/domain/entity/game-user.entity';
import { Session } from 'src/domain/entity/session.entity';
import { GameUserControllerMessage } from 'src/domain/message/game-user-controller.message';
import { IdentityHelper } from 'src/domain/helper/identity.helper';
import { StarterRace } from 'src/domain/enum/starter-race.enum';
import { IRequest, IRequestHandler } from 'src/application/interface/mediator/i-request';
import { RequestHandler } from 'src/domain/decorator/request-handler.decorator';
import { CreateGameUserReqDto } from './create-game-user-command-req.dto';
import { Request as ExpressRequest } from 'express';

export class CreateGameUserCommand implements IRequest<[string, string]> {
    constructor(public readonly reqDto: CreateGameUserReqDto) { }
}

@RequestHandler(CreateGameUserCommand)
export class CreateGameUserCommandHandler implements IRequestHandler<CreateGameUserCommand, [string, string]> {
    constructor(
        @Inject(IBaseWriteUnitOfWork)
        private readonly unitOfWork: IBaseWriteUnitOfWork,

        @Inject(IHttpContextAccessor)
        private readonly httpContextAccessor: IHttpContextAccessor,
    ) { }

    async handle(data: CreateGameUserCommand): Promise<[string, string]> {
        const { reqDto } = data;

        const httpContext = this.httpContextAccessor.get<ExpressRequest>();
        const sessionId = httpContext?.headers['session-id'] as string;

        if (!sessionId) {
            return [GameUserControllerMessage.Create.USER_NOT_FOUND, ''];
        }

        const sessionRepository = this.unitOfWork.getRepository<Session>(Session.name);
        const sessions = await sessionRepository
            .queryCondition({ _id: sessionId })
            .join('user')
            .exec();

        const session = sessions[0];
        if (!session) {
            return [GameUserControllerMessage.Create.USER_NOT_FOUND, ''];
        }

        const userId = typeof session.user === 'string' ? session.user : (session.user as any)._id;

        reqDto.userId = userId;

        const userRepository = this.unitOfWork.getRepository<User>(User.name);
        const currentUser = await userRepository.single({ _id: userId });
        if (!currentUser) {
            return [GameUserControllerMessage.Create.USER_NOT_FOUND, ''];
        }

        const userMaxGameUser = currentUser.max_game_user || 3;

        const gameUserRepository = this.unitOfWork.getRepository<GameUser>(GameUser.name);

        const existingGameUsers = await gameUserRepository
            .queryCondition({ userId: userId })
            .exec();

        if (existingGameUsers.length >= userMaxGameUser) {
            return [GameUserControllerMessage.Create.MAX_GAME_USER_REACHED, ''];
        }

        const characterNameExists = existingGameUsers.some(
            (gameUser: GameUser) => gameUser.character_name === reqDto.character_name
        );

        if (characterNameExists) {
            return [GameUserControllerMessage.Create.CHARACTER_NAME_EXISTS, ''];
        }

        const gameUserId = IdentityHelper.generateUUID();
        const newGameUser: Partial<GameUser> = {
            _id: gameUserId,
            character_name: reqDto.character_name,
            race: StarterRace.Human,
            gender: reqDto.gender,
            character: null,
            inventory: null,
            equipments: null,
            userId: userId,
        };

        await gameUserRepository.add(newGameUser);

        await userRepository.updateWithOperator(
            { _id: userId },
            { $push: { gameprofile: gameUserId } }
        );

        await this.unitOfWork.saveChanges();

        return ['', gameUserId];
    }
}

import { Inject } from '@nestjs/common';
import { IBaseWriteUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-write.unit-of-work';
import { IHttpContextAccessor } from 'src/application/interface/http/i-http-context-accessor';
import { ICacheManager } from 'src/application/interface/cache-manager/i-cache-manager';
import { User } from 'src/domain/entity/user.entity';
import { AuthControllerMessage } from 'src/domain/message/auth-controller.message';
import { HashHelper } from 'src/domain/helper/hash.helper';
import { Session, sessionExpiresIn } from 'src/domain/entity/session.entity';
import { IdentityHelper } from 'src/domain/helper/identity.helper';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { IRequest, IRequestHandler } from 'src/application/interface/mediator/i-request';
import { LoginReqDto } from './login-command-req.dto';
import { Request } from 'express';
import { RequestHandler } from 'src/domain/decorator/request-handler.decorator';
import { IMailService } from 'src/application/interface/mail-service/i-mail-service';
import { ConfigKeyConstant } from 'src/domain/constant/configkey.constant';
import { NodeEnv } from 'src/domain/enum/node_env';

export class LoginCommand implements IRequest<[string, string]> {
   constructor(public readonly loginReqDto: LoginReqDto) {}
}

@RequestHandler(LoginCommand)
export class LoginCommandHandler implements IRequestHandler<LoginCommand, [string, string]> {
   constructor(
      @Inject(IBaseWriteUnitOfWork)
      private readonly unitOfWork: IBaseWriteUnitOfWork,

      @Inject(IHttpContextAccessor)
      private readonly httpContextAccessor: IHttpContextAccessor,

      @Inject(ICacheManager)
      private readonly cacheManager: ICacheManager,

      @Inject(ILogger)
      private readonly logger: ILogger,

      @Inject(IMailService)
      private readonly mailService: IMailService,
   ) {}
   async handle(data: LoginCommand): Promise<[string, string]> {
      const { loginReqDto } = data;

      const userRepository = this.unitOfWork.getRepository<User>(User.name);
      const user = await userRepository.single({ username: loginReqDto.username });
      if (!user) {
         return [AuthControllerMessage.Login.USER_NOT_FOUND, ''];
      }

      if (!(await this.validatePassword(user, loginReqDto.password))) {
         return [AuthControllerMessage.Login.INVALID_CREDENTIALS, ''];
      }

      const sessionRepository = this.unitOfWork.getRepository<Session>(Session.name);
      const sessionCount = await sessionRepository.count({ user: user._id });
      if (sessionCount === user.maxSession) {
         return [AuthControllerMessage.Login.MAX_SESSION_REACHED, ''];
      }

      const httpContext = this.httpContextAccessor.get<Request>();

      const sessionId = IdentityHelper.generateNanoID();
      const session = {
         _id: sessionId,
         user: user._id,
         userAgent: httpContext?.headers['user-agent'] || '',
         ipAddress: (httpContext as any).ip || (httpContext?.headers['x-forwarded-for'] as string),
         expiresAt: new Date(Date.now() + sessionExpiresIn * 1000),
      };

      await sessionRepository.add(session);
      await this.unitOfWork.saveChanges();

      return ['', sessionId];
   }

   private async validatePassword(user: User, password: string): Promise<boolean> {
      if (ConfigKeyConstant.NodeEnv === NodeEnv.Development) {
         return password === ConfigKeyConstant.AppMasterPassword;
      }

      return HashHelper.verify(password, user.password, ConfigKeyConstant.HmacSecret);
   }
}

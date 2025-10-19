import { RegisterReqDto } from './register-command-req.dto';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { IBaseWriteUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-write.unit-of-work';
import { User } from 'src/domain/entity/user.entity';
import { AuthControllerMessage } from 'src/domain/message/auth-controller.message';
import { HashHelper } from 'src/domain/helper/hash.helper';
import { Session, sessionExpiresIn } from 'src/domain/entity/session.entity';
import { IdentityHelper } from 'src/domain/helper/identity.helper';
import { IHttpContextAccessor } from 'src/application/interface/http/i-http-context-accessor';
import { RoleBase } from 'src/domain/enum/role-base.enum';
import { Request as ExpressRequest } from 'express';
import { IRequest, IRequestHandler } from 'src/application/interface/mediator/i-request';
import { RequestHandler } from 'src/domain/decorator/request-handler.decorator';

export class RegisterCommand implements IRequest<[string, string]> {
   constructor(public readonly reqDto: RegisterReqDto) { }
}

@RequestHandler(RegisterCommand)
export class RegisterCommandHandler implements IRequestHandler<RegisterCommand, [string, string]> {
   constructor(
      @Inject(ILogger)
      private readonly logger: ILogger,

      @Inject(IBaseWriteUnitOfWork)
      private readonly unitOfWork: IBaseWriteUnitOfWork,
   ) { }
   async handle(data: RegisterCommand): Promise<[string, string]> {
      const { reqDto } = data;

      if (reqDto.confirmPassword !== reqDto.password) {
         return [AuthControllerMessage.Register.PASSWORD_MISMATCH, ''];
      }

      const userRepository = this.unitOfWork.getRepository<User>(User.name);
      if (await userRepository.any({ username: reqDto.username })) {
         return [AuthControllerMessage.Register.USERNAME_EXISTS, ''];
      }

      // Kiểm tra email đã tồn tại
      if (await userRepository.any({ email: reqDto.email })) {
         return [AuthControllerMessage.Register.EMAIL_EXISTS, ''];
      }

      const sessionRepository = this.unitOfWork.getRepository<Session>(Session.name);

      const sessionId = IdentityHelper.generateNanoID();
      const userId = IdentityHelper.generateUUID();

      await userRepository.add({
         _id: userId,
         username: reqDto.username,
         email: reqDto.email,
         password: HashHelper.hashString(reqDto.password),
         role: [RoleBase.User],
      });

      await sessionRepository.add({
         _id: sessionId,
         user: userId,
         expiresAt: new Date(Date.now() + sessionExpiresIn * 1000),
      });

      await this.unitOfWork.saveChanges();
      return ['', sessionId];
   }
}

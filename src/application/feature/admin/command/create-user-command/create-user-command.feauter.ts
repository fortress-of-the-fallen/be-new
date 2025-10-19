import { Inject } from '@nestjs/common';
import { IBaseWriteUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-write.unit-of-work';
import { IRequest, IRequestHandler } from 'src/application/interface/mediator/i-request';
import { ConfigKeyConstant } from 'src/domain/constant/configkey.constant';
import { RequestHandler } from 'src/domain/decorator/request-handler.decorator';
import { User } from 'src/domain/entity/user.entity';
import { RoleBase } from 'src/domain/enum/role-base.enum';
import { HashHelper } from 'src/domain/helper/hash.helper';
import { AdminControllerMessages } from 'src/domain/message/admin-controller.message';

export class CreateUserCommand implements IRequest<string> {
   constructor(
      public readonly username: string,
      public readonly password: string,
      public readonly role: RoleBase[],
      public readonly name?: string,
   ) {}
}

@RequestHandler(CreateUserCommand)
export class CreateUserCommandHandler implements IRequestHandler<CreateUserCommand, string> {
   constructor(
      @Inject(IBaseWriteUnitOfWork)
      private readonly unitOfWork: IBaseWriteUnitOfWork,
   ) {}

   async handle(request: CreateUserCommand): Promise<string> {
      const userRepo = this.unitOfWork.getRepository<User>(User.name);

      if (await userRepo.any({ username: request.username })) {
         return AdminControllerMessages.CreateUser.AlreadyExists;
      }

      await userRepo.add({
         username: request.username,
         password: HashHelper.hashString(request.password.trim(), ConfigKeyConstant.HmacSecret),
         name: request.name,
         role: request.role,
      });

      await this.unitOfWork.saveChanges();

      return '';
   }
}

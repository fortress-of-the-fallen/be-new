import { Body, Inject, Post, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserCommand } from 'src/application/feature/admin/command/create-user-command/create-user-command.feauter';
import { IMediator } from 'src/application/interface/mediator/i-mediator';
import { Controllers } from 'src/domain/decorator/controller.decorator';
import { Roles } from 'src/domain/decorator/role.decorator';
import { RoleBase } from 'src/domain/enum/role-base.enum';
import { isNullOrEmpty } from 'src/domain/helper/string.helper';
import { CreateAccountReq } from 'src/presentation/model/req/admin/create-account-req.model';
import { ExecutionRes } from 'src/presentation/model/res/base/execution-res.model';

@ApiTags('admin')
@Controllers({ path: 'admin', version: '1' })
export class AdminController {
   constructor(
      @Inject(IMediator)
      private readonly mediator: IMediator,
   ) {}

   @Post('/account')
   @ApiOkResponse({
      type: ExecutionRes,
      description: 'Returns execution result',
   })
   @UseInterceptors(AnyFilesInterceptor())
   @ApiConsumes('multipart/form-data')
   @Roles(RoleBase.Admin)
   async createAccount(@Body() createAccountReq: CreateAccountReq): Promise<ExecutionRes> {
      const res: ExecutionRes = new ExecutionRes();

      const errorCode: string = await this.mediator.send(
         new CreateUserCommand(
            createAccountReq.username,
            createAccountReq.password,
            createAccountReq.role,
            createAccountReq.name,
         ),
      );

      if (!isNullOrEmpty(errorCode)) {
         res.success = false;
         res.errorCode = errorCode;

         return res;
      }

      return res;
   }
}

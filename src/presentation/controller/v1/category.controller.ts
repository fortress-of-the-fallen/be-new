import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Delete, Inject, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCategoryCommandReqDto } from 'src/application/feature/category/command/create-category-command/create-category-command-req.dto';
import { CreateCategoryCommand } from 'src/application/feature/category/command/create-category-command/create-category-command.feature';
import { DeleteCategoryCommand } from 'src/application/feature/category/command/delete-category-command/delete-category-command.feature';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { IMediator } from 'src/application/interface/mediator/i-mediator';
import { Controllers } from 'src/domain/decorator/controller.decorator';
import { Roles } from 'src/domain/decorator/role.decorator';
import { RoleBase } from 'src/domain/enum/role-base.enum';
import { isNullOrEmpty } from 'src/domain/helper/string.helper';
import { CreateCategoryReqModel } from 'src/presentation/model/req/category/create-category-req.model';
import { ExecutionRes } from 'src/presentation/model/res/base/execution-res.model';

@ApiTags('Category')
@Controllers({ path: 'category', version: '1' })
@Roles(RoleBase.Admin)
export class CategoryController {
   constructor(
      @Inject(ILogger)
      private readonly logger: ILogger,

      @Inject(IMediator)
      private readonly mediator: IMediator,

      @InjectMapper()
      private readonly mapper: Mapper,
   ) {}

   @Post()
   @ApiOperation({ summary: 'Create a new book category' })
   @ApiOkResponse({
      type: ExecutionRes,
      description: 'Returns execution result',
   })
   async CreateBookCategory(@Body() req: CreateCategoryReqModel): Promise<ExecutionRes> {
      const response: ExecutionRes = new ExecutionRes();

      const errorCode: string = await this.mediator.send(
         new CreateCategoryCommand(
            this.mapper.map(req, CreateCategoryReqModel, CreateCategoryCommandReqDto),
         ),
      );

      if (!isNullOrEmpty(errorCode)) {
         response.errorCode = errorCode;
         response.success = false;
         return response;
      }

      response.success = true;
      return response;
   }

   @Delete(':categoryId')
   @ApiOperation({ summary: 'Delete a book category' })
   @ApiOkResponse({
      type: ExecutionRes,
      description: 'Returns execution result',
   })
   async DeleteBookCategory(@Param('categoryId') categoryId: string): Promise<ExecutionRes> {
      const response: ExecutionRes = new ExecutionRes();

      const errorCode: string = await this.mediator.send(new DeleteCategoryCommand(categoryId));

      if (!isNullOrEmpty(errorCode)) {
         response.errorCode = errorCode;
         response.success = false;
         return response;
      }

      response.success = true;
      return response;
   }
}

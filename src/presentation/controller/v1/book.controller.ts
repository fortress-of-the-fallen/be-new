import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Inject, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateBookCommandReqDto } from 'src/application/feature/book/command/create-book-command/create-book-command-req.dto';
import { CreateBookCommand } from 'src/application/feature/book/command/create-book-command/create-book-command.feature';
import { ILogger } from 'src/application/interface/logger/i-logger';
import { IMediator } from 'src/application/interface/mediator/i-mediator';
import { Controllers } from 'src/domain/decorator/controller.decorator';
import { Roles } from 'src/domain/decorator/role.decorator';
import { AllRoles } from 'src/domain/enum/role-base.enum';
import { isNullOrEmpty } from 'src/domain/helper/string.helper';
import { CreateBookReqModel } from 'src/presentation/model/req/book/create-book-req.model';
import { ExecutionRes } from 'src/presentation/model/res/base/execution-res.model';

@ApiTags('Book')
@Controllers({ path: 'book', version: '1' })
@Roles(...AllRoles)
export class BookController {
   constructor(
      @Inject(ILogger)
      private readonly logger: ILogger,

      @Inject(IMediator)
      private readonly mediator: IMediator,

      @InjectMapper()
      private readonly mapper: Mapper,
   ) {}

   @Post()
   @ApiOperation({ summary: 'Create a new book' })
   @ApiConsumes('multipart/form-data')
   @UseInterceptors(FileInterceptor('file'))
   @ApiOkResponse({
      type: ExecutionRes,
      description: 'Returns execution result',
   })
   @ApiBody({
      description: 'Upload file',
      schema: {
         type: 'object',
         properties: {
            file: {
               type: 'string',
               format: 'binary',
            },
            title: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
         },
      },
   })
   async CreateBook(
      @UploadedFile() thumbnail: Express.Multer.File,
      @Body() req: CreateBookReqModel,
   ): Promise<ExecutionRes> {
      const response: ExecutionRes = new ExecutionRes();

      const error: string = await this.mediator.send(
         new CreateBookCommand(
            this.mapper.map(req, CreateBookReqModel, CreateBookCommandReqDto),
            thumbnail,
         ),
      );
      if (!isNullOrEmpty(error)) {
         response.success = false;
         response.errorCode = error;
         return response;
      }

      response.success = true;
      return response;
   }
}

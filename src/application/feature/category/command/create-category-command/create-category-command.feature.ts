import { CreateCategoryCommandReqDto } from './create-category-command-req.dto';
import { Inject } from '@nestjs/common';
import { IBaseWriteUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-write.unit-of-work';
import { IRequest, IRequestHandler } from 'src/application/interface/mediator/i-request';
import { RequestHandler } from 'src/domain/decorator/request-handler.decorator';
import { BookCategory } from 'src/domain/entity/book-category.entity';
import { BookCategoryControllerMessage } from 'src/domain/message/book-category-controller.message';

export class CreateCategoryCommand implements IRequest<string> {
   constructor(public readonly createCategoryCommandReqDto: CreateCategoryCommandReqDto) {}
}

@RequestHandler(CreateCategoryCommand)
export class CreateCategoryCommandHandler
   implements IRequestHandler<CreateCategoryCommand, string>
{
   constructor(
      @Inject(IBaseWriteUnitOfWork)
      private readonly writeUnitOfWork: IBaseWriteUnitOfWork,
   ) {}
   async handle(data: CreateCategoryCommand): Promise<string> {
      const { createCategoryCommandReqDto } = data;

      const categoryRepository = this.writeUnitOfWork.getRepository<BookCategory>(
         BookCategory.name,
      );

      if (await categoryRepository.any({ name: createCategoryCommandReqDto.name })) {
         return BookCategoryControllerMessage.Create.EXISTED;
      }

      await categoryRepository.add({
         name: createCategoryCommandReqDto.name,
         description: createCategoryCommandReqDto.description,
      });

      await this.writeUnitOfWork.saveChanges();
      return '';
   }
}

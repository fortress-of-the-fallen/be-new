import { Inject, Injectable, Scope } from '@nestjs/common';
import { IBaseWriteUnitOfWork } from 'src/application/interface/data-access/base-data-access/unit-of-work/i-write.unit-of-work';
import { IRequest, IRequestHandler } from 'src/application/interface/mediator/i-request';
import { RequestHandler } from 'src/domain/decorator/request-handler.decorator';
import { BookCategory } from 'src/domain/entity/book-category.entity';
import { BookCategoryControllerMessage } from 'src/domain/message/book-category-controller.message';

export class DeleteCategoryCommand implements IRequest<string> {
   constructor(public readonly categoryId: string) {}
}

@RequestHandler(DeleteCategoryCommand)
export class DeleteCategoryCommandHandler
   implements IRequestHandler<DeleteCategoryCommand, string>
{
   constructor(
      @Inject(IBaseWriteUnitOfWork)
      private readonly writeUnitOfWork: IBaseWriteUnitOfWork,
   ) {}
   async handle(data: DeleteCategoryCommand): Promise<string> {
      const { categoryId } = data;

      const categoryRepository = this.writeUnitOfWork.getRepository<BookCategory>(
         BookCategory.name,
      );

      if (!(await categoryRepository.any({ _id: categoryId }))) {
         return BookCategoryControllerMessage.Delete.NOT_FOUND;
      }

      await categoryRepository.delete(categoryId);
      await this.writeUnitOfWork.saveChanges();
      return '';
   }
}

import { IRequest, IRequestHandler } from 'src/application/interface/mediator/i-request';
import { CreateBookCommandReqDto } from './create-book-command-req.dto';
import { RequestHandler } from 'src/domain/decorator/request-handler.decorator';

export class CreateBookCommand implements IRequest<string> {
   constructor(
      public readonly createBookCommandReqDto: CreateBookCommandReqDto,
      public readonly thumbnail: Express.Multer.File,
   ) {}
}

@RequestHandler(CreateBookCommand)
export class CreateBookCommandHandler implements IRequestHandler<CreateBookCommand, string> {
   handle(data: CreateBookCommand): Promise<string> {
      throw new Error('Method not implemented.');
   }
}

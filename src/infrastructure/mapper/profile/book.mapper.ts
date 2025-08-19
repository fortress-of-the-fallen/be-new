import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { CreateBookCommandReqDto } from 'src/application/feature/book/command/create-book-command/create-book-command-req.dto';
import { Profile } from 'src/domain/decorator/profile.decorator';
import { CreateBookReqModel } from 'src/presentation/model/req/book/create-book-req.model';

@Profile()
export class BookMapper extends AutomapperProfile {
   constructor(@InjectMapper() mapper: Mapper) {
      super(mapper);
   }

   override get profile() {
      return (mapper: Mapper) => {
         createMap(mapper, CreateBookReqModel, CreateBookCommandReqDto);
      };
   }
}

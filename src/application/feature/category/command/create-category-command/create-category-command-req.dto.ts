import { AutoMap } from '@automapper/classes';

export class CreateCategoryCommandReqDto {
   @AutoMap()
   name: string;

   @AutoMap()
   description?: string;
}

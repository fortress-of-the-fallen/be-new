import { AutoMap } from '@automapper/classes';

export class CreateBookCommandReqDto {
   @AutoMap()
   title: string;

   @AutoMap()
   description: string;

   @AutoMap()
   category: string;
}

import { AutoMap } from '@automapper/classes';

export class LoginReqDto {
   @AutoMap()
   username: string;

   @AutoMap()
   password: string;

   @AutoMap()
   rememberMe?: boolean;

   @AutoMap()
   connectionId: string;
}

import { AutoMap } from '@automapper/classes';

export class RegisterReqDto {
   @AutoMap()
   username: string;

   @AutoMap()
   email: string;

   @AutoMap()
   password: string;

   @AutoMap()
   confirmPassword: string;
}

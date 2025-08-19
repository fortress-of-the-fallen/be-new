import { AutoMap } from '@automapper/classes';

export class RegisterReqDto {
   @AutoMap()
   username: string;

   @AutoMap()
   password: string;

   @AutoMap()
   confirmPassword: string;
}

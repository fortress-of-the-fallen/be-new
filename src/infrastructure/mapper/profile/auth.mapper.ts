import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { LoginReqDto } from 'src/application/feature/auth/command/login-command/login-command-req.dto';
import { RegisterReqDto } from 'src/application/feature/auth/command/register-command/register-command-req.dto';
import { Profile } from 'src/domain/decorator/profile.decorator';
import { LoginReq } from 'src/presentation/model/req/auth/login-req.model';
import { RegisterReq } from 'src/presentation/model/req/auth/register-req.model';

@Profile()
export class AuthMapper extends AutomapperProfile {
   constructor(@InjectMapper() mapper: Mapper) {
      super(mapper);
   }

   override get profile() {
      return (mapper: Mapper) => {
         createMap(mapper, RegisterReq, RegisterReqDto);

         createMap(mapper, LoginReq, LoginReqDto);
      };
   }
}

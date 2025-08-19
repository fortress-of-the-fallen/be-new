import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleBase } from '../enum/role-base.enum';
import { ROLES_KEY } from '../constant/roles.constant';
import { RolesGuard } from 'src/presentation/guard/roles.guard';
import { ApiSecurity } from '@nestjs/swagger';

export function Roles(...roles: RoleBase[]) {
   return applyDecorators(
      SetMetadata(ROLES_KEY, roles),
      UseGuards(RolesGuard),
      ApiSecurity('session'),
   );
}

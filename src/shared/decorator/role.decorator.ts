import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleBase } from 'src/features/auth/application/role-base.enum';
import { ROLES_KEY } from '../constant/roles.constant';
import { RolesGuard } from 'src/api/guard/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Applies role metadata, authorization guard, and session security docs.
 */
export function Roles(...roles: RoleBase[]) {
   return applyDecorators(
      SetMetadata(ROLES_KEY, roles),
      UseGuards(RolesGuard),
      ApiBearerAuth('access-token'),
   );
}

import { RoleBase } from 'src/features/auth/application/role-base.enum';

export type RequestAuthContext = {
   accountId: string;
   playerId: string;
   username: string;
   roles: RoleBase[];
   sessionId: string;
};

export type AccessTokenClaims = {
   sub: string;
   playerId: string;
   username: string;
   roles: string[];
   sid: string;
   iat: number;
   exp: number;
   typ: 'access';
};

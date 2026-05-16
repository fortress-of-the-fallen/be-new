import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { ConfigKeyConstant } from 'src/shared/constant/configkey.constant';
import { AccessTokenClaims } from './auth-context';

const ACCESS_TOKEN_VERSION = 1;
const ACCESS_TOKEN_TYPE = 'JWT';
const ACCESS_TOKEN_ALGORITHM = 'HS256';

@Injectable()
export class AccessTokenService {
   private readonly secret = Buffer.from(ConfigKeyConstant.HmacSecret, 'hex');

   sign(claims: Omit<AccessTokenClaims, 'iat' | 'exp' | 'typ'>, expiresInSeconds: number): string {
      const now = Math.floor(Date.now() / 1000);
      const payload: AccessTokenClaims & { ver: number } = {
         ...claims,
         typ: 'access',
         iat: now,
         exp: now + expiresInSeconds,
         ver: ACCESS_TOKEN_VERSION,
      };

      const encodedHeader = this.base64UrlEncode(
         JSON.stringify({
            alg: ACCESS_TOKEN_ALGORITHM,
            typ: ACCESS_TOKEN_TYPE,
         }),
      );
      const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
      const signature = this.signRaw(`${encodedHeader}.${encodedPayload}`);

      return `${encodedHeader}.${encodedPayload}.${signature}`;
   }

   verify(token?: string): AccessTokenClaims | null {
      if (!token) {
         return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
         return null;
      }

      const [encodedHeader, encodedPayload, encodedSignature] = parts;
      const expectedSignature = this.signRaw(`${encodedHeader}.${encodedPayload}`);

      if (!this.safeCompare(expectedSignature, encodedSignature)) {
         return null;
      }

      try {
         const header = JSON.parse(this.base64UrlDecode(encodedHeader)) as {
            alg?: string;
            typ?: string;
         };
         if (header.alg !== ACCESS_TOKEN_ALGORITHM || header.typ !== ACCESS_TOKEN_TYPE) {
            return null;
         }

         const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as
            | (AccessTokenClaims & { ver?: number })
            | null;

         if (!payload || payload.typ !== 'access' || payload.ver !== ACCESS_TOKEN_VERSION) {
            return null;
         }

         const now = Math.floor(Date.now() / 1000);
         if (!payload.exp || payload.exp <= now) {
            return null;
         }

         if (!payload.sub || !payload.playerId || !payload.sid || !payload.username) {
            return null;
         }

         return {
            sub: payload.sub,
            playerId: payload.playerId,
            username: payload.username,
            roles: Array.isArray(payload.roles) ? payload.roles : [],
            sid: payload.sid,
            iat: payload.iat,
            exp: payload.exp,
            typ: 'access',
         };
      } catch {
         return null;
      }
   }

   private signRaw(value: string): string {
      return this.base64UrlEncode(createHmac('sha256', this.secret).update(value).digest());
   }

   private base64UrlEncode(value: string | Buffer): string {
      return Buffer.from(value)
         .toString('base64')
         .replace(/\+/g, '-')
         .replace(/\//g, '_')
         .replace(/=+$/g, '');
   }

   private base64UrlDecode(value: string): string {
      const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
      const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
      return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
   }

   private safeCompare(left: string, right: string): boolean {
      const leftBuffer = Buffer.from(left);
      const rightBuffer = Buffer.from(right);

      if (leftBuffer.length !== rightBuffer.length) {
         return false;
      }

      return timingSafeEqual(leftBuffer, rightBuffer);
   }
}

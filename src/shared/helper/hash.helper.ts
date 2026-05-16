import { createHash, createHmac } from 'crypto';
import { ConfigKeyConstant } from '../constant/configkey.constant';

export class HashHelper {
   private static readonly key: string = ConfigKeyConstant.HmacSecret;

   static hashString(
      data: string,
      key?: string,
      algorithm: 'sha256' | 'sha512' = 'sha256',
   ): string {
      const secret = key ?? this.key;

      if (secret) {
         return createHmac(algorithm, Buffer.from(secret, 'hex')).update(data).digest('hex');
      }

      return createHash(algorithm).update(data).digest('hex');
   }

   static verify(
      data: string,
      expectedHash: string,
      key?: string,
      algorithm: 'sha256' | 'sha512' = 'sha256',
   ): boolean {
      const hash = this.hashString(data, key, algorithm);
      return hash === expectedHash;
   }
}

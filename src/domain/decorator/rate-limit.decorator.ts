import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

export function RateLimit({ limit, ttl }: { limit: number; ttl: number }) {
   return applyDecorators(UseGuards(ThrottlerGuard), Throttle({ default: { limit, ttl } }));
}

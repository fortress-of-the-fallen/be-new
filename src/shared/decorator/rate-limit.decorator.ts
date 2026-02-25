import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

/**
 * Applies route-level rate limiting with NestJS throttler guard.
 */
export function RateLimit({ limit, ttl }: { limit: number; ttl: number }) {
   return applyDecorators(UseGuards(ThrottlerGuard), Throttle({ default: { limit, ttl } }));
}

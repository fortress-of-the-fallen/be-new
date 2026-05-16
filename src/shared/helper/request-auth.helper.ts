export function extractBearerToken(authorizationHeader?: string): string | undefined {
   if (!authorizationHeader) {
      return undefined;
   }

   const [scheme, ...rest] = authorizationHeader.trim().split(/\s+/);
   const value = rest.join(' ');
   if (!scheme || !value || scheme.toLowerCase() !== 'bearer') {
      return undefined;
   }

   return value.trim();
}

export function extractRequestToken(headers: Record<string, unknown>): string | undefined {
   const authorization =
      typeof headers.authorization === 'string' ? headers.authorization : undefined;
   const bearerToken = extractBearerToken(authorization);
   if (bearerToken) {
      return bearerToken;
   }

   const sessionId = typeof headers['session-id'] === 'string' ? headers['session-id'] : undefined;
   return sessionId?.trim() || undefined;
}

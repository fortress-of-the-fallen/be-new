import { extractBearerToken, extractRequestToken } from './request-auth.helper';

describe('request-auth.helper', () => {
   describe('extractBearerToken', () => {
      it('returns undefined when header is missing', () => {
         expect(extractBearerToken()).toBeUndefined();
      });

      it('returns undefined for non-bearer schemes', () => {
         expect(extractBearerToken('Basic abc')).toBeUndefined();
      });

      it('returns undefined when bearer token is blank', () => {
         expect(extractBearerToken('Bearer    ')).toBeUndefined();
      });

      it('returns trimmed bearer token', () => {
         expect(extractBearerToken('Bearer   token-123   ')).toBe('token-123');
      });
   });

   describe('extractRequestToken', () => {
      it('prefers bearer authorization token', () => {
         expect(
            extractRequestToken({
               authorization: 'Bearer access-123',
               'session-id': 'session-456',
            }),
         ).toBe('access-123');
      });

      it('falls back to session-id when bearer token is absent', () => {
         expect(
            extractRequestToken({
               authorization: 'Basic abc',
               'session-id': ' session-456 ',
            }),
         ).toBe('session-456');
      });

      it('returns undefined when session-id is not a string', () => {
         expect(extractRequestToken({ authorization: 'Basic abc', 'session-id': 123 })).toBeUndefined();
      });

      it('returns undefined when no valid token exists', () => {
         expect(extractRequestToken({ authorization: 123, 'session-id': '   ' })).toBeUndefined();
      });
   });
});

import { buildErrorResponse, buildSuccessResponse } from './api-envelope.model';

describe('api-envelope.model', () => {
   beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-02T03:04:05.000Z'));
   });

   afterEach(() => {
      jest.useRealTimers();
   });

   it('builds a success response with server time', () => {
      const data = { id: 'p1', level: 10 };

      expect(buildSuccessResponse(data)).toEqual({
         success: true,
         data,
         serverTime: '2026-01-02T03:04:05.000Z',
      });
   });

   it('builds an error response with default details', () => {
      expect(buildErrorResponse('BAD_REQ', 'Bad request')).toEqual({
         success: false,
         error: {
            code: 'BAD_REQ',
            message: 'Bad request',
            details: {},
         },
         serverTime: '2026-01-02T03:04:05.000Z',
      });
   });

   it('builds an error response with explicit details', () => {
      const details = { field: 'username' };

      expect(buildErrorResponse('VALIDATION_FAILED', 'Validation failed', details)).toEqual({
         success: false,
         error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details,
         },
         serverTime: '2026-01-02T03:04:05.000Z',
      });
   });
});

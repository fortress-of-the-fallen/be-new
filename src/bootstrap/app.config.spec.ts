import { ValidationError } from 'class-validator';
import { ApiErrorCode } from 'src/api/api-error-code';
import { buildValidationException } from './app.config';

describe('buildValidationException', () => {
   it('returns CONFIG_VERSION_MISSING when configVersion is absent', () => {
      const exception = buildValidationException([
         {
            property: 'configVersion',
            value: undefined,
            constraints: {
               isNotEmpty: 'configVersion should not be empty',
               isString: 'configVersion must be a string',
            },
            children: [],
         } as ValidationError,
      ]);

      expect(exception.message).toBe('configVersion is required');
      expect(exception.errorCode).toBe(ApiErrorCode.ConfigVersionMissing);
      expect(exception.validationErrors).toEqual([
         'configVersion should not be empty',
         'configVersion must be a string',
      ]);
   });

   it('keeps VALIDATION_FAILED for non-configVersion schema errors', () => {
      const exception = buildValidationException([
         {
            property: 'mode',
            value: 'INVALID',
            constraints: {
               isIn: 'mode must be one of the following values: PVP, PVE, FAKE_PVP',
            },
            children: [],
         } as ValidationError,
      ]);

      expect(exception.message).toBe('Validation failed');
      expect(exception.errorCode).toBeUndefined();
      expect(exception.validationErrors).toEqual([
         'mode must be one of the following values: PVP, PVE, FAKE_PVP',
      ]);
   });
});

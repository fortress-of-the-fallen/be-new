import { isNullOrEmpty } from './string.helper';

describe('string.helper', () => {
   it('returns true for null', () => {
      expect(isNullOrEmpty(null as any)).toBe(true);
   });

   it('returns true for blank strings', () => {
      expect(isNullOrEmpty('   ')).toBe(true);
   });

   it('returns false for non-empty strings', () => {
      expect(isNullOrEmpty('hero')).toBe(false);
   });
});

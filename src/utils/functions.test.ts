import { RegionId, completeMask } from 'coretime-utils';

import {
  extractRegionIdFromRaw,
  parseHNString,
  parseHNStringToString,
} from './functions';

describe('Util functions', () => {
  describe('parseHNString', () => {
    it('works', () => {
      const a = '100,305';
      expect(parseHNString(a)).toBe(100305);
      const b = '42';
      expect(parseHNString(b)).toBe(42);
      expect(parseHNString('')).toBe(NaN);
    });
  });

  describe('parseHNStringToString', () => {
    it('works', () => {
      const a = '100,305';
      expect(parseHNStringToString(a)).toBe('100305');
      const b = '42';
      expect(parseHNStringToString(b)).toBe('42');
      expect(parseHNStringToString('')).toBe('');
    });
  });

  describe('extractRegionIdFromRaw', () => {
    it('works', () => {
      const raw = '316913858982876965003350507519';
      const regionId: RegionId = {
        begin: 4,
        core: 0,
        mask: completeMask(),
      };
      expect(extractRegionIdFromRaw(BigInt(raw))).toStrictEqual(regionId);
    });
  });
});

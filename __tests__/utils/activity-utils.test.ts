import {
  getActivityTypeFromCategories,
  getCupTypeFromTitle,
} from '../../src/scrapers/utils/activity-utils';
import { CUP, MATCH, OTHER, TRAINING } from '../../src/types/types';

describe('Activity Utilities', () => {
  describe('getActivityTypeFromCategories', () => {
    it('determines activity type from categories', () => {
      expect(getActivityTypeFromCategories(['Match', 'Fotboll'])).toBe(MATCH);
      expect(getActivityTypeFromCategories(['Träning'])).toBe(TRAINING);
      expect(getActivityTypeFromCategories(['Övrig aktivitet'])).toBe(OTHER);
      expect(getActivityTypeFromCategories(['Other'])).toBeUndefined();
      expect(getActivityTypeFromCategories([])).toBeUndefined();
      expect(getActivityTypeFromCategories(undefined)).toBeUndefined();
    });
  });

  describe('getCupTypeFromTitle', () => {
    it('determines activity type from title', () => {
      expect(getCupTypeFromTitle('Match mot IFK')).toBeUndefined();
      expect(getCupTypeFromTitle('Träning i hallen')).toBeUndefined();
      expect(getCupTypeFromTitle('Övrig aktivitet: Teambuilding')).toBeUndefined();
      expect(getCupTypeFromTitle('Random text')).toBeUndefined();
      expect(getCupTypeFromTitle('')).toBeUndefined();
      expect(getCupTypeFromTitle(undefined)).toBeUndefined();
    });

    it('identifies cup events as OTHER', () => {
      expect(getCupTypeFromTitle('Gothia Cup')).toBe(CUP);
      expect(getCupTypeFromTitle('Vårcupen Tyresö')).toBe(CUP);
      expect(getCupTypeFromTitle('Deltar i Cup 2023')).toBe(CUP);
    });
  });
});

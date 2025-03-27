import { ACTIVITY_TYPES } from '../../src/utils/activity-utils';
import { getActivityTypeFromCategories } from '../../src/utils/activity-utils';

describe('Activity Utilities', () => {
  describe('getActivityTypeFromCategories', () => {
    it('determines activity type from categories', () => {
      expect(getActivityTypeFromCategories(['Match', 'Fotboll'])).toBe(ACTIVITY_TYPES.MATCH);
      expect(getActivityTypeFromCategories(['Träning'])).toBe(ACTIVITY_TYPES.TRAINING);
      expect(getActivityTypeFromCategories(['Övrig aktivitet'])).toBe(ACTIVITY_TYPES.OTHER);
      expect(getActivityTypeFromCategories(['Other'])).toBe('unknown');
      expect(getActivityTypeFromCategories([])).toBe('unknown');
      expect(getActivityTypeFromCategories(undefined)).toBe('unknown');
    });
  });
});

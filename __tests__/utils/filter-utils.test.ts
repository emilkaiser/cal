import { buildFilterTags } from '../../src/utils/filter-utils';
import { CalendarEvent } from '../../src/types/types';

describe('Filter Utilities', () => {
  describe('buildFilterTags', () => {
    it('generates filter tags from a complete event', () => {
      const event: CalendarEvent = {
        uid: 'test-1',
        title: 'Test Event',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        formattedTeam: 'P2015 Blå',
        team: 'IFK Aspudden-Tellus Blå 1',
        match: 'Home',
        venues: ['Aspuddens IP', 'Aspuddens IP 1'],
        activity: 'Match',
        gender: 'Pojkar',
        ageGroup: '2015',
        color: 'Blå',
      };

      const tags = buildFilterTags(event);
      expect(tags).toContain('team:P2015 Blå');
      expect(tags).toContain('match:Home');
      expect(tags).toContain('location:Aspuddens IP');
      expect(tags).toContain('location:Aspuddens IP 1');
      expect(tags).toContain('category:Match');
      expect(tags).toContain('gender:Pojkar');
      expect(tags).toContain('ageGroup:2015');
      expect(tags).toContain('color:Blå');
    });

    it('falls back to team property when formattedTeam is missing', () => {
      const event: CalendarEvent = {
        uid: 'test-2',
        title: 'Test Event',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        team: 'IFK Aspudden-Tellus Blå 1',
      };

      const tags = buildFilterTags(event);
      expect(tags).toContain('team:IFK Aspudden-Tellus Blå 1');
    });

    it('falls back to categories when activity is missing', () => {
      const event: CalendarEvent = {
        uid: 'test-3',
        title: 'Test Event',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        categories: ['Match', 'Division 1'],
      };

      const tags = buildFilterTags(event);
      expect(tags).toContain('category:Match');
    });

    it('skips tags when corresponding properties are missing', () => {
      const event: CalendarEvent = {
        uid: 'test-4',
        title: 'Test Event',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
      };

      const tags = buildFilterTags(event);
      expect(tags).toEqual([]);
    });

    it('skips color tag when color is "unknown"', () => {
      const event: CalendarEvent = {
        uid: 'test-5',
        title: 'Test Event',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        color: 'unknown',
      };

      const tags = buildFilterTags(event);
      expect(tags).not.toContain('color:unknown');
    });
  });
});

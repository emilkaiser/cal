import { getEventType, extractAgeGroup } from '../../src/scrapers/utils/event-categorizer';
import { CalendarEvent } from '../../src/types/types';

describe('Event Categorizer Utilities', () => {
  describe('getEventType', () => {
    it('returns event type from categories', () => {
      const event: CalendarEvent = {
        title: 'Event Title',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        categories: ['Match'],
        uid: 'test-uid-1',
        rawData: {},
      };
      expect(getEventType(event)).toBe('Match');
    });

    it('identifies match from title containing vs', () => {
      const event: CalendarEvent = {
        title: 'Team A vs Team B',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        uid: 'test-uid-2',
        rawData: {},
      };
      expect(getEventType(event)).toBe('Match');
    });

    it('identifies match from title containing mot', () => {
      const event: CalendarEvent = {
        title: 'Team A mot Team B',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        uid: 'test-uid-3',
        rawData: {},
      };
      expect(getEventType(event)).toBe('Match');
    });

    it('identifies match from title containing dash', () => {
      const event: CalendarEvent = {
        title: 'Team A - Team B',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        uid: 'test-uid-4',
        rawData: {},
      };
      expect(getEventType(event)).toBe('Match');
    });

    it('identifies training from title', () => {
      const event: CalendarEvent = {
        title: 'Träning P2015',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        uid: 'test-uid-5',
        rawData: {},
      };
      expect(getEventType(event)).toBe('Träning');
    });

    it('identifies cup from title', () => {
      const event: CalendarEvent = {
        title: 'Summer Cup',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        uid: 'test-uid-6',
        rawData: {},
      };
      expect(getEventType(event)).toBe('Cup');
    });

    it('identifies tournament from title', () => {
      const event: CalendarEvent = {
        title: 'Sommar Turnering',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        uid: 'test-uid-7',
        rawData: {},
      };
      expect(getEventType(event)).toBe('Turnering');
    });

    it('identifies meeting from title', () => {
      const event: CalendarEvent = {
        title: 'Föräldra Möte',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        uid: 'test-uid-8',
        rawData: {},
      };
      expect(getEventType(event)).toBe('Möte');
    });

    it('returns undefined for unrecognized titles', () => {
      const event: CalendarEvent = {
        title: 'Something else entirely',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        uid: 'test-uid-9',
        rawData: {},
      };
      expect(getEventType(event)).toBeUndefined();
    });

    it('returns undefined for events with no title', () => {
      const event: CalendarEvent = {
        title: '',
        start: new Date(),
        end: new Date(),
        sourceType: 'laget',
        uid: 'test-uid-10',
        rawData: {},
      };
      expect(getEventType(event)).toBeUndefined();
    });
  });

  describe('extractAgeGroup', () => {
    it('extracts age group from "P2012-" format', () => {
      expect(extractAgeGroup('P2012-')).toBe('2012');
    });

    it('extracts age group from "P2012- 3K" format', () => {
      expect(extractAgeGroup('P2012- 3K')).toBe('2012');
    });
    it('extracts age group from "P2010- 3C" format', () => {
      expect(extractAgeGroup('P2010- 3C')).toBe('2010');
    });

    it('extracts age group from "P2012" format', () => {
      expect(extractAgeGroup('P2012')).toBe('2012');
    });

    it('extracts age group from "F2011" format', () => {
      expect(extractAgeGroup('F2011')).toBe('2011');
    });

    it('extracts age group from two-digit format', () => {
      expect(extractAgeGroup('P12')).toBeUndefined();
      expect(extractAgeGroup('F09')).toBeUndefined();
    });

    it('extracts standalone year', () => {
      expect(extractAgeGroup('Division 2015')).toBeUndefined();
    });

    it('returns undefined when no age group is found', () => {
      expect(extractAgeGroup('No age group here')).toBeUndefined();
    });

    it('returns undefined for non age group categories "P19 Div.1 2025 - Region 4"', () => {
      expect(extractAgeGroup('P19 Div.1 2025 - Region 4')).toBeUndefined();
    });

    it('returns undefined for empty or undefined input', () => {
      expect(extractAgeGroup('')).toBeUndefined();
      expect(extractAgeGroup(undefined)).toBeUndefined();
    });

    it('handles more complex strings with multiple patterns', () => {
      expect(extractAgeGroup('IFK Aspudden-Tellus P2015 Blå vs Team B')).toBe('2015');
      expect(extractAgeGroup('Match P2013- 3C Aspudden vs AIK')).toBe('2013');
      expect(extractAgeGroup('P2012- 3K Nyckelviken')).toBe('2012');
    });

    it('prioritizes four-digit years over two-digit years', () => {
      expect(extractAgeGroup('P12 2014 Tournament')).toBe('2014');
    });

    it('handles edge cases with partial year matches', () => {
      expect(extractAgeGroup('Event 202')).toBeUndefined(); // Not a complete year
      expect(extractAgeGroup('P20122')).toBeUndefined(); // Too many digits
    });
  });
});

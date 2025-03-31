import { Activity, CalendarEvent } from '../types/types';
import { getHomeAwayCategory as getMatchCategory } from './match-utils';

// Common event types in calendars
export const EVENT_TYPES = {
  MATCH: 'Match',
  TRAINING: 'Träning',
  CUP: 'Cup',
  TOURNAMENT: 'Turnering',
  MEETING: 'Möte',
  EVENT: 'Event',
  OTHER: 'Övrigt',
};

// Use the version from match-utils.ts instead
export const getHomeAwayCategory = getMatchCategory;

export function getEventType(event: CalendarEvent): Activity | undefined {
  if (!event.title) {
    return undefined;
  }

  // First check if the event already has a category that matches an event type
  if (event.categories && event.categories.length > 0) {
    for (const category of event.categories) {
      const eventType = Object.values(EVENT_TYPES).find(
        type => category.toLowerCase() === type.toLowerCase()
      );
      if (eventType) {
        return eventType as Activity;
      }
    }
  }

  // Check if the title starts with any of the known event types
  const title = event.title.trim();
  for (const [_, prefix] of Object.entries(EVENT_TYPES)) {
    if (
      title.toLowerCase().startsWith(`${prefix.toLowerCase()} - `) ||
      title.toLowerCase().startsWith(`${prefix.toLowerCase()}: `)
    ) {
      return prefix as Activity;
    }
  }

  // Look for specific patterns in the title
  if (
    title.toLowerCase().includes(' vs ') ||
    title.toLowerCase().includes(' mot ') ||
    /\s+-\s+/.test(title)
  ) {
    return EVENT_TYPES.MATCH as Activity;
  }

  if (title.toLowerCase().includes('träning') || title.toLowerCase().includes('training')) {
    return EVENT_TYPES.TRAINING as Activity;
  }

  if (title.toLowerCase().includes('cup')) {
    return EVENT_TYPES.CUP as Activity;
  }

  if (title.toLowerCase().includes('turnering')) {
    return EVENT_TYPES.TOURNAMENT as Activity;
  }

  if (title.toLowerCase().includes('möte') || title.toLowerCase().includes('mote')) {
    return EVENT_TYPES.MEETING as Activity;
  }

  return undefined;
}

/**
 * Extract age group from a string (e.g., title, category)
 * Handles formats like "P2012", "F2011-", "P12", etc.
 * Returns only the year part without P/F prefix
 */
export function extractAgeGroup(text: string | undefined): string | undefined {
  if (!text) return undefined;

  // First check for full 4-digit years (highest priority)
  const yearMatch = text.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    return yearMatch[1];
  }

  // Match Swedish football age group patterns:
  // P2012, F2010, P12, F09, P2012-, P2012- 3K, etc.
  const patterns = [
    // Pattern for "P2012-", "P2012- 3K", etc.
    /\b([PF])(\d{4})(-|\s*-\s*)/i,

    // Pattern for "P2012", "F2010", etc.
    /\b([PF])(\d{4})\b/i,

    // Pattern for "P12", "F09", etc.
    /\b([PF])(\d{2})\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const [_, gender, year] = match;

      // Return only the year part
      if (year.length === 4) {
        return year;
      } else if (year.length === 2) {
        // For two-digit years, assume 20xx
        return `20${year}`;
      }
    }
  }

  return undefined;
}

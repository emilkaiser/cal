import { Activity, CalendarEvent } from '../../types/types';

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

  // Match Swedish football age group patterns:
  // P2012, F2010, P12, F09, P2012-, P2012- 3K, etc.
  const patterns = [
    // Pattern for "P2012-", "P2012- 3K", etc.
    /\b([PF])(\d{4})(-|\s*-\s*)/i,

    // Pattern for "P2012", "F2010", etc.
    /\b([PF])(\d{4})\b/i,
  ];

  // Check for explicit age groups with 4 digits (highest priority)
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // We have a direct match for a four-digit age group
      return match[2];
    }
  }

  // Only extract standalone years if they aren't part of division/league names
  if (!/Div\.|Division|Region|League|Series|Cup|Season|[-–—]\s*Region \d/.test(text)) {
    const yearMatch = text.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      return yearMatch[1];
    }
  }

  return undefined;
}

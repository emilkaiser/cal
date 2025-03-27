import { CalendarEvent } from '../types/types';
import { getHomeAwayCategory, getEventType, extractAgeGroup } from './categorize-events';
import { extractVenues, isHomeVenue } from './location-utils';

export interface EventSourceData {
  uid?: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  url?: string;
  categories?: string[];
  sourceType: 'laget' | 'team' | 'venue' | 'other';
  teamName?: string;
  venues?: string[];
  rawData?: any; // Original data for reference
}

export function normalizeEvent(event: EventSourceData): CalendarEvent {
  // Start with basic event data
  const normalizedEvent: CalendarEvent = {
    uid: event.uid || `event-${Math.random().toString(36).substring(2)}`,
    title: event.title,
    start: event.start,
    end: event.end,
    description: event.description,
    location: event.location,
    url: event.url,
    categories: event.categories || [],
    sourceType: event.sourceType,
  };

  // Determine event type if not already set
  if (!normalizedEvent.activity) {
    normalizedEvent.activity = getEventType(normalizedEvent);
  }

  if (!normalizedEvent.ageGroup) {
    normalizedEvent.ageGroup = extractAgeGroup(normalizedEvent.title);
  }

  if (!normalizedEvent.venues && normalizedEvent.location) {
    normalizedEvent.venues = extractVenues(normalizedEvent.location);
    normalizedEvent.categories = normalizedEvent.categories ?? [];

    for (const venue of normalizedEvent.venues) {
      if (!normalizedEvent.categories.includes(venue)) {
        normalizedEvent.categories.push(venue);
      }
    }
  }

  // Determine home/away status if not already set
  if (!normalizedEvent.match && normalizedEvent.activity === 'Match') {
    const homeAway = getHomeAwayCategory(normalizedEvent);
    if (homeAway) {
      normalizedEvent.match = homeAway.toLowerCase() as 'Home' | 'Away';

      // Add to categories if not already there
      normalizedEvent.categories = normalizedEvent.categories || [];
      if (!normalizedEvent.categories.includes(homeAway)) {
        normalizedEvent.categories.push(homeAway);
      }
    }
  }

  return normalizedEvent;
}

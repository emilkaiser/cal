import { useState, useEffect, useMemo } from 'react';
import { CalendarEvent } from '../types/types';
import { allDataSources, normalizeEvents, addSourceToEvents } from './data-sources';
import { DataSource } from './data-sources';
import allVenues from '@/data/venue/all.json';
import { normalizeCalendarEvents } from '@/scrapers/utils/calendar-utils';

// Memoization cache
const memoizedEvents = new Map();
const memoizedVenueEvents = new Map();

// Process and prepare all event data with memoization
export const getAllEvents = (): { events: CalendarEvent[]; dataSources: DataSource[] } => {
  // Use unique key for this combination of data sources
  const cacheKey = 'all-events-' + allDataSources.map(s => s.id).join('-');

  if (memoizedEvents.has(cacheKey)) {
    return memoizedEvents.get(cacheKey);
  }

  console.time('getAllEvents');
  // Get all events from data sources
  const dataSourceEvents = allDataSources.flatMap(source =>
    source.events.map(event => ({
      ...event,
      source: source.id,
    }))
  );

  // Process venue events
  const venueEvents = processVenueEvents();

  const result = {
    events: [...dataSourceEvents, ...venueEvents],
    dataSources: allDataSources,
  };
  console.timeEnd('getAllEvents');

  // Store in cache
  memoizedEvents.set(cacheKey, result);
  return result;
};

// Process venue data with memoization
function processVenueEvents(): CalendarEvent[] {
  const cacheKey = 'venue-events';
  if (memoizedVenueEvents.has(cacheKey)) {
    return memoizedVenueEvents.get(cacheKey);
  }

  // Normalize venue events first
  const normalizedEvents = normalizeEvents(allVenues as any[]);

  // Group events by venue
  const eventsByVenue = groupVenueEvents(normalizedEvents);

  // Combine all venue events with their source IDs
  let allVenueEvents: CalendarEvent[] = [];

  for (const venueId of Object.keys(eventsByVenue)) {
    const venueEvents = eventsByVenue[venueId];
    const eventsWithSource = addSourceToEvents(venueEvents, venueId);
    allVenueEvents = [...allVenueEvents, ...eventsWithSource];
  }

  // Store in cache
  memoizedVenueEvents.set(cacheKey, allVenueEvents);
  return allVenueEvents;
}

// Group events by venue
function groupVenueEvents(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  const eventsByVenue: Record<string, CalendarEvent[]> = {
    'aspuddens-ip-1': [],
    'aspuddens-ip-2': [],
    'vastberga-ip': [],
  };

  events.forEach(event => {
    // Check location to determine venue
    if (event.location) {
      if (event.location.includes('Aspuddens IP 1')) {
        eventsByVenue['aspuddens-ip-1'].push(event);
      } else if (event.location.includes('Aspuddens IP 2')) {
        eventsByVenue['aspuddens-ip-2'].push(event);
      } else if (event.location.includes('Västberga IP')) {
        eventsByVenue['vastberga-ip'].push(event);
      }
    }
  });

  return eventsByVenue;
}

// Get venue data for displaying venue information
export function getVenueData(): Record<
  string,
  { name: string; location: string; eventsCount: number }
> {
  const eventsByVenue = groupVenueEvents(normalizeEvents(allVenues as any[]));

  return {
    'aspuddens-ip-1': {
      name: 'Aspuddens IP 1',
      location: 'Aspudden, Stockholm',
      eventsCount: eventsByVenue['aspuddens-ip-1'].length,
    },
    'aspuddens-ip-2': {
      name: 'Aspuddens IP 2',
      location: 'Aspudden, Stockholm',
      eventsCount: eventsByVenue['aspuddens-ip-2'].length,
    },
    'vastberga-ip': {
      name: 'Västberga IP',
      location: 'Västberga, Stockholm',
      eventsCount: eventsByVenue['vastberga-ip'].length,
    },
  };
}

/**
 * React hook to load calendar data with state management
 */
export function useLoadCalendarData() {
  const [data, setData] = useState<{ events: CalendarEvent[]; dataSources: DataSource[] }>({
    events: [],
    dataSources: [],
  });

  useEffect(() => {
    // Performance measurement
    console.time('useLoadCalendarData');

    // Get all events
    const { events, dataSources } = getAllEvents();

    // Parse date strings to Date objects and normalize in one pass
    const normalizedEvents = normalizeCalendarEvents(
      events.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))
    );

    setData({
      events: normalizedEvents,
      dataSources,
    });

    console.timeEnd('useLoadCalendarData');
  }, []);

  return data;
}

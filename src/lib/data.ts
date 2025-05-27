import { useState, useEffect, useMemo } from 'react';
import { CalendarEvent } from '../types/types';
import { getAllDataSources, normalizeEvents, addSourceToEvents } from './data-sources';
import { DataSource } from './data-sources';
import { fetchGithubJson } from './utils';
import { normalizeCalendarEvents } from '@/scrapers/utils/calendar-utils';

// Memoization cache
const memoizedEvents = new Map();
const memoizedVenueEvents = new Map();

// Process and prepare all event data with memoization
export const getAllEvents = async (): Promise<{
  events: CalendarEvent[];
  dataSources: DataSource[];
}> => {
  try {
    // Use unique key for this combination of data sources
    const cacheKey = 'all-events';

    if (memoizedEvents.has(cacheKey)) {
      console.log('Using cached events');
      return memoizedEvents.get(cacheKey);
    }

    console.time('getAllEvents');
    console.log('Fetching data sources...');
    // Get all events from data sources
    const dataSources = await getAllDataSources();
    console.log('Data sources fetched:', dataSources);

    if (!dataSources || !Array.isArray(dataSources)) {
      console.error('Invalid data sources:', dataSources);
      throw new Error('Failed to load data sources');
    }

    console.log('Processing data source events...');
    const dataSourceEvents = dataSources.flatMap(source => {
      console.log('Processing source:', source.id, 'Events:', source.events);
      if (!source.events || !Array.isArray(source.events)) {
        console.error('Invalid events for source:', source.id, source.events);
        return [];
      }
      return source.events.map(event => ({
        ...event,
        source: source.id,
      }));
    });
    console.log('Data source events processed:', dataSourceEvents);

    // Process venue events
    console.log('Processing venue events...');
    const venueEvents = await processVenueEvents();
    console.log('Venue events processed:', venueEvents);

    if (!venueEvents || !Array.isArray(venueEvents)) {
      console.error('Invalid venue events:', venueEvents);
      throw new Error('Failed to load venue events');
    }

    const result = {
      events: [...dataSourceEvents, ...venueEvents],
      dataSources,
    };
    console.log('Final result:', result);
    console.timeEnd('getAllEvents');

    // Store in cache
    memoizedEvents.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error in getAllEvents:', error);
    return { events: [], dataSources: [] };
  }
};

// Process venue data with memoization
async function processVenueEvents(): Promise<CalendarEvent[]> {
  try {
    const cacheKey = 'venue-events';
    if (memoizedVenueEvents.has(cacheKey)) {
      console.log('Using cached venue events');
      return memoizedVenueEvents.get(cacheKey);
    }

    console.log('Fetching venue data...');
    // Fetch and normalize venue events
    const allVenues = await fetchGithubJson<any[]>('data/venue/all.json');
    console.log('Venue data fetched:', allVenues);

    if (!allVenues || !Array.isArray(allVenues)) {
      console.error('Invalid venue data:', allVenues);
      throw new Error('Failed to load venue data');
    }

    console.log('Normalizing venue events...');
    const normalizedEvents = normalizeEvents(allVenues);
    console.log('Normalized events:', normalizedEvents);

    // Group events by venue
    console.log('Grouping events by venue...');
    const eventsByVenue = groupVenueEvents(normalizedEvents);
    console.log('Events grouped by venue:', eventsByVenue);

    // Combine all venue events with their source IDs
    let allVenueEvents: CalendarEvent[] = [];

    for (const venueId of Object.keys(eventsByVenue)) {
      const venueEvents = eventsByVenue[venueId];
      if (venueEvents && Array.isArray(venueEvents)) {
        const eventsWithSource = addSourceToEvents(venueEvents, venueId);
        allVenueEvents = [...allVenueEvents, ...eventsWithSource];
      }
    }

    console.log('Final venue events:', allVenueEvents);

    // Store in cache
    memoizedVenueEvents.set(cacheKey, allVenueEvents);
    return allVenueEvents;
  } catch (error) {
    console.error('Error in processVenueEvents:', error);
    return [];
  }
}

// Group events by venue
function groupVenueEvents(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  console.log('Grouping events:', events);
  if (!events || !Array.isArray(events)) {
    console.error('Invalid events in groupVenueEvents:', events);
    return {
      'aspuddens-ip-1': [],
      'aspuddens-ip-2': [],
      'vastberga-ip': [],
    };
  }

  const eventsByVenue: Record<string, CalendarEvent[]> = {
    'aspuddens-ip-1': [],
    'aspuddens-ip-2': [],
    'vastberga-ip': [],
  };

  events.forEach(event => {
    // Check location to determine venue
    if (event && event.location) {
      if (event.location.includes('Aspuddens IP 1')) {
        eventsByVenue['aspuddens-ip-1'].push(event);
      } else if (event.location.includes('Aspuddens IP 2')) {
        eventsByVenue['aspuddens-ip-2'].push(event);
      } else if (event.location.includes('Västberga IP')) {
        eventsByVenue['vastberga-ip'].push(event);
      }
    }
  });

  console.log('Events grouped by venue:', eventsByVenue);
  return eventsByVenue;
}

// Get venue data for displaying venue information
export async function getVenueData(): Promise<
  Record<string, { name: string; location: string; eventsCount: number }>
> {
  try {
    console.log('Fetching venue data...');
    const allVenues = await fetchGithubJson<any[]>('data/venue/all.json');
    console.log('Venue data fetched:', allVenues);

    if (!allVenues || !Array.isArray(allVenues)) {
      console.error('Invalid venue data:', allVenues);
      throw new Error('Failed to load venue data');
    }

    const eventsByVenue = groupVenueEvents(normalizeEvents(allVenues));
    console.log('Venue data processed:', eventsByVenue);

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
  } catch (error) {
    console.error('Error in getVenueData:', error);
    return {
      'aspuddens-ip-1': { name: 'Aspuddens IP 1', location: 'Aspudden, Stockholm', eventsCount: 0 },
      'aspuddens-ip-2': { name: 'Aspuddens IP 2', location: 'Aspudden, Stockholm', eventsCount: 0 },
      'vastberga-ip': { name: 'Västberga IP', location: 'Västberga, Stockholm', eventsCount: 0 },
    };
  }
}

/**
 * React hook to load calendar data with state management
 */
export function useLoadCalendarData() {
  const [data, setData] = useState<{ events: CalendarEvent[]; dataSources: DataSource[] }>({
    events: [],
    dataSources: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    // Performance measurement
    console.time('useLoadCalendarData');
    console.log('Starting to load calendar data...');

    // Get all events
    getAllEvents()
      .then(({ events, dataSources }) => {
        if (!isMounted) return;

        console.log('Calendar data loaded:', { events, dataSources });
        if (!events || !Array.isArray(events)) {
          console.error('Invalid events in useLoadCalendarData:', events);
          setError(new Error('Invalid events data received'));
          return;
        }

        // Parse date strings to Date objects and normalize in one pass
        console.log('Normalizing calendar events...');
        const normalizedEvents = normalizeCalendarEvents(
          events.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          }))
        );
        console.log('Events normalized:', normalizedEvents);

        setData({
          events: normalizedEvents,
          dataSources,
        });
      })
      .catch(error => {
        if (!isMounted) return;
        console.error('Error loading calendar data:', error);
        setError(error);
        setData({ events: [], dataSources: [] });
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
        console.timeEnd('useLoadCalendarData');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { ...data, isLoading, error };
}

import { useState, useEffect } from 'react';
import { CalendarEvent } from '../types/types';
import { allDataSources, normalizeEvents, addSourceToEvents } from './data-sources';
import { DataSource } from './data-sources';
import allVenues from '@/data/venue/all.json';
import { normalizeCalendarEvents } from '@/utils/calendar-utils';

// Process and prepare all event data
export const getAllEvents = (): { events: CalendarEvent[]; dataSources: DataSource[] } => {
  // Get all events from data sources
  const dataSourceEvents = allDataSources.flatMap(source =>
    source.events.map(event => ({
      ...event,
      source: source.id,
    }))
  );

  // Process venue events
  const venueEvents = processVenueEvents();

  return {
    events: [...dataSourceEvents, ...venueEvents],
    dataSources: allDataSources,
  };
};

// Process venue data
function processVenueEvents(): CalendarEvent[] {
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
    // Get all events
    const { events, dataSources } = getAllEvents();

    // Parse date strings to Date objects
    const parsedEvents = events.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));

    // Normalize events to ensure all properties are in filterTags
    const normalizedEvents = normalizeCalendarEvents(parsedEvents);

    setData({
      events: normalizedEvents,
      dataSources,
    });
  }, []);

  return data;
}

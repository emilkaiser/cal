import { CalendarEvent } from '../types/types';
import { fetchGithubJson } from './utils';

export interface DataSource {
  id: string;
  name: string;
  events: CalendarEvent[];
  color: string;
}

// Create data sources from the venue JSON files
export const getVenueDataSources = async (): Promise<DataSource[]> => {
  const sources: DataSource[] = [];

  const aspuddensIp1 = await fetchGithubJson<any[]>('data/venue/aspuddens-ip-1.json');
  const aspuddensIp2 = await fetchGithubJson<any[]>('data/venue/aspuddens-ip-2.json');
  const vastbergaIp = await fetchGithubJson<any[]>('data/venue/vastberga-ip.json');

  sources.push({
    id: 'venue-aspuddens-ip-1',
    name: 'Aspuddens IP 1',
    events: normalize(aspuddensIp1),
    color: 'hsl(240, 70%, 50%)',
  });

  sources.push({
    id: 'venue-aspuddens-ip-2',
    name: 'Aspuddens IP 2',
    events: normalize(aspuddensIp2),
    color: 'hsl(270, 70%, 50%)',
  });

  sources.push({
    id: 'venue-vastberga-ip',
    name: 'Västberga IP',
    events: normalize(vastbergaIp),
    color: 'hsl(300, 70%, 50%)',
  });

  return sources;
};

// Create laget data source
export const getLagetDataSource = async (): Promise<DataSource> => {
  const lagetData = await fetchGithubJson<any[]>('data/laget/calendar.json');
  const data = normalize(lagetData).map(event => ({
    ...event,
    title: event.formattedTitle,
  }));
  return {
    id: 'laget',
    name: 'Laget Calendar',
    events: data as CalendarEvent[],
    color: 'hsl(210, 70%, 50%)',
  };
};

// Helper function to ensure all events have a URL property and dates are converted to Date objects
// Add a cache to avoid repeated normalization of the same events
const normalizeCache = new WeakMap();
function normalize(events: any[]): CalendarEvent[] {
  // Check if we've already normalized these exact events
  if (normalizeCache.has(events)) {
    return normalizeCache.get(events);
  }

  const normalized = events.map(event => ({
    ...event,
    url: event.url || '#', // Add a default URL if missing
    start: event.start instanceof Date ? event.start : new Date(event.start),
    end: event.end instanceof Date ? event.end : new Date(event.end),
    sourceType: event.sourceType || 'other',
  }));

  // Cache the results
  normalizeCache.set(events, normalized);
  return normalized;
}

// Get all available data sources
export const getAllDataSources = async (): Promise<DataSource[]> => {
  const [lagetSource, venueSources] = await Promise.all([
    getLagetDataSource(),
    getVenueDataSources(),
  ]);
  return [lagetSource, ...venueSources];
};

// Export helper functions for use in other files
export function normalizeEvents(events: any[]): CalendarEvent[] {
  return normalize(events);
}

// Add source information to events
export function addSourceToEvents(events: CalendarEvent[], sourceId: string): CalendarEvent[] {
  return events.map(event => ({
    ...event,
    source: sourceId,
  }));
}

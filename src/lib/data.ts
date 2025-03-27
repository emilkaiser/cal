import { CalendarEvent } from '../types/types';
import { getAllDataSources, DataSource } from './dataSources';

// Get all calendar events from all sources
export function getAllCalendarEvents(): CalendarEvent[] {
  const allSources = getAllDataSources();
  return allSources.flatMap(source =>
    source.events.map(event => ({
      ...event,
      source: source.id, // Tag each event with its source
    }))
  );
}

// Get all available data sources
export function getDataSources(): DataSource[] {
  return getAllDataSources();
}

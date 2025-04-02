'use client';

import { useMemo } from 'react';
import TeamCalendar from './TeamCalendar';
import type { CalendarEvent as BaseCalendarEvent } from '../types/types';
import { DataSource } from '@/lib/data-sources';

interface CalendarEvent extends Omit<BaseCalendarEvent, 'start' | 'end'> {
  start: Date;
  end: Date;
  source?: string;
}

interface CalendarClientProps {
  initialEvents: BaseCalendarEvent[];
  dataSources: DataSource[];
}

// Cache for normalized events to prevent recalculation
const normalizedEventsCache = new WeakMap();

export default function CalendarClient({ initialEvents, dataSources }: CalendarClientProps) {
  // Process events only once using useMemo
  const processedEvents = useMemo(() => {
    // Check cache first
    if (normalizedEventsCache.has(initialEvents)) {
      return normalizedEventsCache.get(initialEvents);
    }

    // Parse date strings to Date objects
    const parsedEvents = initialEvents.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));

    // Store in cache
    normalizedEventsCache.set(initialEvents, parsedEvents);
    return parsedEvents;
  }, [initialEvents]);

  return (
    <>
      {processedEvents.length > 0 ? (
        <TeamCalendar events={processedEvents} dataSources={dataSources} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Loading calendar data...</h2>
        </div>
      )}
    </>
  );
}

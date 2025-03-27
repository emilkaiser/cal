'use client';

import { useState, useEffect } from 'react';
import TeamCalendar from './TeamCalendar';
import type { CalendarEvent as BaseCalendarEvent } from '../types/types';
import type { DataSource } from '@/lib/dataSources';

interface CalendarEvent extends Omit<BaseCalendarEvent, 'start' | 'end'> {
  start: Date;
  end: Date;
  source?: string;
}

interface CalendarClientProps {
  initialEvents: BaseCalendarEvent[];
  dataSources: DataSource[];
}

export default function CalendarClient({ initialEvents, dataSources }: CalendarClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    // Parse date strings to Date objects
    const parsedEvents = initialEvents.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));

    setEvents(parsedEvents);
  }, [initialEvents]);

  return (
    <>
      {events.length > 0 ? (
        <TeamCalendar events={events} dataSources={dataSources} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Loading calendar data...</h2>
        </div>
      )}
    </>
  );
}

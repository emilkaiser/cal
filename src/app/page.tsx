'use client';

import { useState, useEffect } from 'react';
import TeamCalendar from '@/components/TeamCalendar';
import { getAllEvents } from '@/lib/data';
import { CalendarEvent } from '@/types/types';
import { DataSource } from '@/lib/data-sources';
import { normalizeCalendarEvents } from '@/utils/calendar-utils';

export default function Home() {
  const [data, setData] = useState<{ events: CalendarEvent[]; dataSources: DataSource[] }>({
    events: [],
    dataSources: [],
  });
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  }, []);

  return (
    <main>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Loading calendar data...</h2>
        </div>
      ) : (
        <TeamCalendar events={data.events} dataSources={data.dataSources} />
      )}
    </main>
  );
}

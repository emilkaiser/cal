'use client';

import { useState, useEffect } from 'react';
import TeamCalendar from '@/components/TeamCalendar';
import { getAllEvents } from '@/lib/data';
import { CalendarEvent } from '@/types/types';
import { DataSource } from '@/lib/data-sources';

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

    setData({
      events: parsedEvents,
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

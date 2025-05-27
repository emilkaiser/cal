'use client';

import TeamCalendar from '@/components/TeamCalendar';
import { useLoadCalendarData } from '@/lib/data';

export default function Home() {
  const { events, dataSources, isLoading, error } = useLoadCalendarData();

  if (isLoading) {
    return (
      <main>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Loading calendar data...</h2>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Error loading calendar data</h2>
          <p>{error.message}</p>
        </div>
      </main>
    );
  }

  if (!events || events.length === 0) {
    return (
      <main>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>No events found</h2>
        </div>
      </main>
    );
  }

  return (
    <main>
      <TeamCalendar events={events} dataSources={dataSources} />
    </main>
  );
}

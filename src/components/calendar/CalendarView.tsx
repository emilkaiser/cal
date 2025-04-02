'use client';

import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent } from '@/components/ui/card';
import { getDataSourceColor } from '@/lib/color-utils';
import type { CalendarEvent } from '@/types/types';
import { MATCH_HOME, MATCH_AWAY } from '@/types/types';
import { DataSource } from '@/lib/data-sources';

// Configure moment to start the week on Monday
moment.updateLocale('en', {
  week: {
    dow: 1, // Monday is the first day of the week
    doy: 4, // The week that contains Jan 4th is the first week of the year
  },
});

// Use moment for localization
const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  filteredEvents: CalendarEvent[];
  date: Date;
  view: View;
  formats: any;
  views: any;
  handleDateChange: (date: Date) => void;
  handleViewChange: (view: View) => void;
  handleEventSelect: (event: CalendarEvent) => void;
  eventTooltip: (event: CalendarEvent) => string;
  dataSources?: DataSource[];
}

export const CalendarView = ({
  filteredEvents,
  date,
  view,
  formats,
  views,
  handleDateChange,
  handleViewChange,
  handleEventSelect,
  eventTooltip,
  dataSources = [],
}: CalendarViewProps) => {
  // Event styling based on source and match type
  const eventPropGetter = (event: CalendarEvent) => {
    // Get the source color directly from the data source
    let sourceColor;
    if (event.source) {
      const dataSource = dataSources.find(ds => ds.id === event.source);
      sourceColor = dataSource?.color || getDataSourceColor(event.source);
    } else {
      sourceColor = getDataSourceColor(undefined);
    }

    // Create style using the source color
    const style = {
      backgroundColor: sourceColor,
      color: '#FFFFFF',
      borderRadius: '4px',
      border: `1px solid ${sourceColor}`,
    };

    // Add match-type specific styles
    return {
      style,
      className: `calendar-event ${
        event.match === MATCH_HOME ? 'home-game' : event.match === MATCH_AWAY ? 'away-game' : ''
      }`,
    };
  };

  return (
    <div style={{ height: '800px' }}>
      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor={(event: CalendarEvent) => event.formattedTitle || event.title}
        tooltipAccessor={eventTooltip}
        eventPropGetter={eventPropGetter}
        formats={formats}
        popup
        views={views}
        date={date}
        view={view}
        onView={handleViewChange}
        onNavigate={handleDateChange}
        onSelectEvent={handleEventSelect}
        style={{ height: '100%' }}
        min={new Date(0, 0, 0, 7, 0)} // 7:00 AM
        max={new Date(0, 0, 0, 23, 0)} // 11:00 PM
        dayPropGetter={date => {
          const today = new Date();
          return {
            className:
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()
                ? 'rbc-today'
                : '',
          };
        }}
      />
    </div>
  );
};

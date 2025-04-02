'use client';

import { useState, useMemo, useCallback } from 'react';
import { View, Views } from 'react-big-calendar';
import moment from 'moment';
import type { CalendarEvent as BaseCalendarEvent } from '../types/types';
import { DataSource } from '@/lib/data-sources';
import { useEventFilters } from '@/hooks/useEventFilters';
import { getPropertyFromFilterTags } from '@/scrapers/utils/calendar-utils';

// Imported components
import { FiltersCard } from './calendar/FiltersCard';
import { CalendarView } from './calendar/CalendarView';
import { EventDetailsDialog } from './calendar/EventDetailsDialog';

interface CalendarEvent extends Omit<BaseCalendarEvent, 'start' | 'end'> {
  start: Date;
  end: Date;
  allDay?: boolean;
  source?: string;
}

interface TeamCalendarProps {
  events: CalendarEvent[];
  dataSources: DataSource[];
}

const TeamCalendar = ({ events, dataSources }: TeamCalendarProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<View>(Views.WEEK);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterExpanded, setFilterExpanded] = useState(false);

  // Use our custom hook for all filtering
  const filters = useEventFilters(events, dataSources);

  // Custom formats for the calendar display
  const formats = useMemo(
    () => ({
      eventTimeRangeFormat: () => {
        return '';
      },
      dayFormat: 'ddd DD',
      dayHeaderFormat: (date: Date) => moment(date).format('dddd'),
    }),
    []
  );

  const views = useMemo(
    () => ({
      month: true,
      week: true,
      day: true,
    }),
    []
  );

  const handleEventSelect = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  const handleDateChange = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const closeDialog = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const toggleFilters = useCallback(() => {
    setFilterExpanded(prev => !prev);
  }, []);

  const getMatchLocationLabel = useCallback((location: string) => {
    switch (location) {
      case 'home':
        return 'Home Games 🏟️';
      case 'away':
        return 'Away Games ✈️';
      case 'other':
        return 'Other Events';
      default:
        return location;
    }
  }, []);

  // Generate a tooltip for events
  const eventTooltip = useCallback((event: CalendarEvent) => {
    const time = `${moment(event.start).format('h:mm A')} - ${moment(event.end).format('h:mm A')}`;
    const team = event.team || getPropertyFromFilterTags(event.filterTags, 'team') || '';
    const venue = event.venues && event.venues.length > 0 ? event.venues[0] : '';

    return `${event.title}
${time}
${team ? `Team: ${team}` : ''}
${venue ? `Venue: ${venue}` : ''}`;
  }, []);

  return (
    <div className="space-y-4">
      <FiltersCard
        filterExpanded={filterExpanded}
        toggleFilters={toggleFilters}
        filters={filters}
        dataSources={dataSources}
        getMatchLocationLabel={getMatchLocationLabel}
        totalEvents={filters.filteredEvents.length}
      />

      <CalendarView
        filteredEvents={filters.filteredEvents}
        date={date}
        view={view}
        formats={formats}
        views={views}
        handleDateChange={handleDateChange}
        handleViewChange={handleViewChange}
        handleEventSelect={handleEventSelect}
        eventTooltip={eventTooltip}
        dataSources={dataSources}
      />

      {selectedEvent && (
        <EventDetailsDialog
          selectedEvent={selectedEvent}
          closeDialog={closeDialog}
          dataSources={dataSources}
        />
      )}
    </div>
  );
};

export default TeamCalendar;

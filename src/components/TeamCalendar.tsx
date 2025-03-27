'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { CalendarEvent as BaseCalendarEvent } from '../types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataSourceSelector } from './DataSourceSelector';
import { DataSource } from '@/lib/dataSources';
import { getHexColor } from '@/utils/team-utils';

// Configure moment to start the week on Monday
moment.updateLocale('en', {
  week: {
    dow: 1, // Monday is the first day of the week
    doy: 4, // The week that contains Jan 4th is the first week of the year
  },
});

// Use moment for localization
const localizer = momentLocalizer(moment);

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

interface FiltersByType {
  [filterType: string]: Set<string>;
}

interface SourceFilters {
  [sourceId: string]: string[];
}

const TeamCalendar = ({ events, dataSources }: TeamCalendarProps) => {
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>(events);
  const [sourceFilters, setSourceFilters] = useState<SourceFilters>({});
  const [availableFiltersBySource, setAvailableFiltersBySource] = useState<{
    [sourceId: string]: { [filterType: string]: string[] };
  }>({});
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<View>(Views.MONTH);
  const [selectedSources, setSelectedSources] = useState<string[]>(
    dataSources.map(source => source.id)
  );

  // Extract unique filter types and values from events, grouped by source
  useEffect(() => {
    const filtersBySource: { [sourceId: string]: FiltersByType } = {};

    events.forEach(event => {
      // Skip events without source or filterTags
      if (!event.source || !event.filterTags) return;

      // Initialize source if not exists
      if (!filtersBySource[event.source]) {
        filtersBySource[event.source] = {};
      }

      // Process each filter tag
      event.filterTags.forEach(tag => {
        const [type, value] = tag.split(':');

        if (type && value) {
          // Initialize filter type if not exists
          if (!filtersBySource[event.source!][type]) {
            filtersBySource[event.source!][type] = new Set<string>();
          }

          // Add value to the filter type
          filtersBySource[event.source!][type].add(tag);
        }
      });
    });

    // Convert Sets to sorted arrays and organize by source
    const result: { [sourceId: string]: { [filterType: string]: string[] } } = {};

    Object.entries(filtersBySource).forEach(([sourceId, filterTypes]) => {
      result[sourceId] = {};

      Object.entries(filterTypes).forEach(([filterType, valuesSet]) => {
        result[sourceId][filterType] = Array.from(valuesSet).sort();
      });
    });

    setAvailableFiltersBySource(result);

    // Initialize empty filters for each source
    const initialFilters: SourceFilters = {};
    Object.keys(result).forEach(sourceId => {
      initialFilters[sourceId] = [];
    });
    setSourceFilters(initialFilters);
  }, [events]);

  // Filter events based on active filters and selected sources
  useEffect(() => {
    let filtered = events.filter(event =>
      // Only include events from selected sources
      event.source ? selectedSources.includes(event.source) : true
    );

    // Apply source-specific filters using AND logic
    filtered = filtered.filter(event => {
      // Skip filtering if event has no source
      if (!event.source) return true;

      // Skip filtering if no filters are set for this source
      if (!sourceFilters[event.source] || sourceFilters[event.source].length === 0) {
        return true;
      }

      // Group selected filters by type
      const selectedFiltersByType: { [type: string]: string[] } = {};
      sourceFilters[event.source].forEach(filter => {
        const [type, value] = filter.split(':');
        if (type && value) {
          if (!selectedFiltersByType[type]) {
            selectedFiltersByType[type] = [];
          }
          selectedFiltersByType[type].push(filter);
        }
      });

      // Apply filters by type using OR logic within type and AND logic between types
      return Object.entries(selectedFiltersByType).every(([type, typeFilters]) => {
        // Each event must match at least one filter value for each selected filter type
        return typeFilters.some(filter => event.filterTags?.includes(filter));
      });
    });

    setFilteredEvents(filtered);
  }, [sourceFilters, events, selectedSources]);

  // Handle filter changes for a specific source
  const handleFilterChange = (sourceId: string, filters: string[]) => {
    setSourceFilters(prevFilters => ({
      ...prevFilters,
      [sourceId]: filters,
    }));
  };

  // Handle source selection changes
  const handleSourceChange = (sources: string[]) => {
    setSelectedSources(sources);
  };

  // Custom event styles
  const eventStyleGetter = (event: CalendarEvent) => {
    // Find the source for this event
    const source = event.source && dataSources.find(s => s.id === event.source);

    // Default style
    let style = {
      backgroundColor: 'hsl(var(--primary))',
      borderRadius: '0.375rem',
      opacity: 0.8,
      color: 'hsl(var(--primary-foreground))',
      border: '0px',
      display: 'block',
    };

    if (event.color) {
      // Use event-specific color if available
      style.backgroundColor =
        getHexColor(event.color) ?? (source ? source.color : style.backgroundColor);
    } else if (source) {
      // If we have a source, use its color
      style.backgroundColor = source.color;
    } else {
      // Legacy logic for home/away games
      const isHomeGame = event.filterTags?.includes('match:Home') ?? false;
      const isAwayGame = event.filterTags?.includes('match:Away') ?? false;

      if (isHomeGame) {
        style.backgroundColor = 'hsl(142.1 76.2% 36.3%)'; // Green for home games
      } else if (isAwayGame) {
        style.backgroundColor = 'hsl(346.8 77.2% 49.8%)'; // Red for away games
      }
    }

    return {
      style,
      className: '',
    };
  };

  // Calendar formats with firstDayOfWeek set to 1 (Monday)
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

  // Define available views
  const views = useMemo(
    () => ({
      month: true,
      week: true,
      day: true,
      agenda: true,
    }),
    []
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Data Sources & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <DataSourceSelector
            dataSources={dataSources}
            selectedSources={selectedSources}
            onSelectionChange={handleSourceChange}
            availableFiltersBySource={availableFiltersBySource}
            sourceFilters={sourceFilters}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>

      <div className="calendar-container" style={{ height: '800px' }}>
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          formats={formats}
          popup
          views={views}
          date={date}
          view={view}
          onView={setView}
          onNavigate={newDate => setDate(newDate)}
          onSelectEvent={event => window.open(event.url, '_blank')}
          style={{ height: '100%', width: '100%' }}
          min={new Date(0, 0, 0, 8, 0)} // 8:00 AM
          max={new Date(0, 0, 0, 23, 0)} // 11:00 PM
        />
      </div>
    </div>
  );
};

export default TeamCalendar;

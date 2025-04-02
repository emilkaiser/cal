'use client';

import { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { CalendarEvent as BaseCalendarEvent } from '../types/types';
import { Card, CardContent } from '@/components/ui/card';
import { DataSource } from '@/lib/data-sources';
import { getHexColor, getVenueColor, getContrastingColor, isLightColor } from '@/utils/color-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getPropertyFromFilterTags } from '@/scrapers/utils/calendar-utils';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

// Lazy load filter components to defer their initialization
const LazyDataSourceSelector = lazy(() =>
  import('./DataSourceSelector').then(mod => ({ default: mod.DataSourceSelector }))
);
const LazyGlobalFilterSelector = lazy(() =>
  import('./GlobalFilterSelector').then(mod => ({ default: mod.GlobalFilterSelector }))
);

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

const TeamCalendar = ({ events, dataSources }: TeamCalendarProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<View>(Views.MONTH);
  const [activeFilterTab, setActiveFilterTab] = useState<string>('sources');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filterLoading, setFilterLoading] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Memoize event style getter to prevent recreation on every render
  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
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

      // Special venue list that should always use venue-based coloring
      const venuePriorityList = ['Aspuddens IP 1', 'Aspuddens IP 2', 'Västberga IP'];

      // Get venues from filterTags
      const venues =
        event.filterTags
          ?.filter((tag: string) => tag.startsWith('venue:'))
          .map((tag: string) => tag.split(':')[1]) || [];

      // Check if event has one of the special venues
      const hasSpecialVenue = venues.some(venue => venuePriorityList.includes(venue));

      // Priority order for colors:
      // 1. Special venues (Aspuddens IP, Västberga IP) always use venue colors
      // 2. Event-specific color (if not a special venue)
      // 3. Venue-based color for other venues
      // 4. Source color
      // 5. Match-type or team-based color

      if (hasSpecialVenue) {
        // Find the first special venue in the list
        const specialVenue = venues.find(venue => venuePriorityList.includes(venue));
        if (specialVenue) {
          style.backgroundColor = getVenueColor(specialVenue);
        }
      } else if (event.color) {
        // Use event-specific color if available and not a special venue
        style.backgroundColor = getHexColor(event.color);
      } else if (venues.length > 0) {
        // Use venue-based color for other venues
        style.backgroundColor = getVenueColor(venues[0]);
      } else if (source) {
        // Use source color
        style.backgroundColor = source.color;
      } else {
        // Match-type color logic for home/away games
        const matchType = getPropertyFromFilterTags(event.filterTags, 'match');
        const isHomeGame = matchType === 'Home';
        const isAwayGame = matchType === 'Away';
        const team = getPropertyFromFilterTags(event.filterTags, 'team');

        if (isHomeGame) {
          style.backgroundColor = 'hsl(142.1 76.2% 36.3%)'; // Green for home games
        } else if (isAwayGame) {
          style.backgroundColor = 'hsl(346.8 77.2% 49.8%)'; // Red for away games
        } else if (team) {
          // Use a contrasting color based on team name hash
          const teamHash = team.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          style.backgroundColor = getContrastingColor(teamHash);
        }
      }

      // Handle light color text contrast
      if (style.backgroundColor.startsWith('#')) {
        if (isLightColor(style.backgroundColor)) {
          style.color = '#000000'; // Black text for light backgrounds
        } else {
          style.color = '#ffffff'; // White text for dark backgrounds
        }
      } else if (style.backgroundColor.startsWith('hsl')) {
        // For HSL colors, check the lightness value
        const lightnessMatch = style.backgroundColor.match(/\d+\.?\d*%\)/);
        if (lightnessMatch && parseFloat(lightnessMatch[0]) > 60) {
          style.color = '#000000'; // Black text for light backgrounds
        } else {
          style.color = '#ffffff'; // White text for dark backgrounds
        }
      }

      return {
        style,
        className: '',
      };
    },
    [dataSources]
  );

  // Fix CustomEventWrapper to match EventWrapperProps interface - memoize
  const CustomEventWrapper = useCallback(({ event, children }: any) => {
    // Get event data from filterTags when possible
    const team = getPropertyFromFilterTags(event.filterTags, 'team') || event.team;
    const ageGroup = getPropertyFromFilterTags(event.filterTags, 'ageGroup') || event.ageGroup;
    const gender = getPropertyFromFilterTags(event.filterTags, 'gender') || event.gender;
    const activity = getPropertyFromFilterTags(event.filterTags, 'activity') || event.activity;
    const matchType = getPropertyFromFilterTags(event.filterTags, 'match') || event.match;
    const venues =
      event.filterTags
        ?.filter((tag: string) => tag.startsWith('venue:'))
        .map((tag: string) => tag.split(':')[1]) ||
      event.venues ||
      [];

    // Create a more detailed tooltip with comprehensive event information
    // Leading with location information
    let locationInfo = '';
    if (venues.length > 0) {
      locationInfo = `Location: ${venues.join(', ')}\n`;
    }

    const tooltip = [
      `${event.title || 'Untitled Event'}`,
      locationInfo, // Display location prominently at the top
      team ? `Team: ${team}` : '',
      ageGroup ? `Age Group: ${ageGroup}` : '',
      gender ? `Gender: ${gender}` : '',
      activity ? `Activity: ${activity}` : '',
      event.categories?.length > 0 ? `Categories: ${event.categories.join(', ')}` : '',
      matchType ? `Match: ${matchType}` : '',
      `Start: ${moment(event.start).format('MMM D, YYYY h:mm A')}`,
      `End: ${moment(event.end).format('MMM D, YYYY h:mm A')}`,
    ]
      .filter(line => line !== '') // Remove empty lines
      .join('\n');

    return <div title={tooltip}>{children}</div>;
  }, []);

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

  // Memoize handlers to prevent recreating on every render
  const handleFilterTabChange = useCallback((value: string) => {
    setActiveFilterTab(value);
  }, []);

  const toggleShowFilters = useCallback(() => {
    if (!showFilters) {
      setFilterLoading(true);

      // Ensure filter data is initialized before showing UI
      setTimeout(() => {
        // This will trigger the data initialization if not already done
        initializeFilterData();

        // After a brief delay to allow data processing, show the UI
        setTimeout(() => {
          setShowFilters(true);
          setFilterLoading(false);
        }, 50);
      }, 10);
    } else {
      setShowFilters(false);
    }
  }, [showFilters, initializeFilterData]);

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

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-wrap gap-2">
              {filterPresets.map(preset => (
                <Button
                  key={preset.id}
                  variant={activePreset === preset.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTogglePreset(preset)}
                >
                  {preset.name}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAllFilters}
                className="border-red-200 hover:bg-red-100 hover:text-red-800"
              >
                Reset All
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleShowFilters}
              disabled={filterLoading}
            >
              {filterLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : showFilters ? (
                'Hide Filters'
              ) : (
                'Show Filters'
              )}
            </Button>
          </div>

          {/* Display active filters as removable tags */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 p-2 bg-muted/50 rounded">
              <span className="text-sm font-medium self-center mr-1">Active Filters:</span>
              {activeFilters.map((filter, index) => (
                <Badge
                  key={`${filter.type}-${filter.value}-${index}`}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  {filter.label}
                  <button
                    className="ml-1 text-xs rounded-full bg-muted w-4 h-4 inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onRemoveFilter(filter.type, filter.value)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={onClearAllFilters}
                >
                  Clear All
                </Button>
              )}
            </div>
          )}

          {(showFilters || filterLoading) && (
            <div
              className={`transition-opacity duration-300 ${
                filterLoading ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {filterLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : (
                <Tabs
                  value={activeFilterTab}
                  onValueChange={handleFilterTabChange}
                  className="w-full"
                >
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="sources" className="flex-1">
                      Data Sources
                    </TabsTrigger>
                    <TabsTrigger value="global" className="flex-1">
                      Global Filters
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="sources" className="mt-0 pt-2">
                    <Suspense
                      fallback={
                        <div className="flex justify-center py-10">
                          <Spinner />
                        </div>
                      }
                    >
                      <LazyDataSourceSelector
                        dataSources={dataSources}
                        selectedSources={selectedSources}
                        onSelectionChange={sources => setSelectedSources(sources)}
                        availableFiltersBySource={availableFiltersBySource}
                        sourceFilters={sourceFilters}
                        onFilterChange={onSourceFilterChange}
                        hiddenSources={hiddenSources}
                        onToggleHiddenSource={onToggleHiddenSource}
                        onClearSourceFilters={onClearSourceFilter}
                      />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="global" className="mt-0 pt-2">
                    <Suspense
                      fallback={
                        <div className="flex justify-center py-10">
                          <Spinner />
                        </div>
                      }
                    >
                      <LazyGlobalFilterSelector
                        availableFilters={availableGlobalFilters}
                        selectedFilters={globalFilters}
                        onFilterChange={onGlobalFilterChange}
                        onClearAll={onClearGlobalFilters}
                      />
                    </Suspense>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div
        className="calendar-container rounded-lg border shadow-sm overflow-hidden"
        style={{ height: '800px' }}
      >
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          components={{ eventWrapper: CustomEventWrapper }}
          formats={formats}
          popup
          views={views}
          date={date}
          view={view}
          onView={handleViewChange}
          onNavigate={handleDateChange}
          onSelectEvent={handleEventSelect}
          style={{ height: '100%', width: '100%' }}
          min={new Date(0, 0, 0, 8, 0)} // 8:00 AM
          max={new Date(0, 0, 0, 23, 0)} // 11:00 PM
        />
      </div>

      {/* Enhanced event details modal with DialogDescription */}
      {selectedEvent && (
        <Dialog open={true} onOpenChange={closeDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedEvent.title || 'Untitled Event'}
              </DialogTitle>
              <DialogDescription>Event details</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Extract information from filterTags when possible */}
              {selectedEvent.filterTags?.some(tag => tag.startsWith('team:')) && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Team:</span>
                  <span className="col-span-3">
                    {getPropertyFromFilterTags(selectedEvent.filterTags, 'team')}
                  </span>
                </div>
              )}

              {selectedEvent.filterTags?.some(tag => tag.startsWith('ageGroup:')) && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Age Group:</span>
                  <span className="col-span-3">
                    {getPropertyFromFilterTags(selectedEvent.filterTags, 'ageGroup')}
                  </span>
                </div>
              )}

              {selectedEvent.filterTags?.some(tag => tag.startsWith('gender:')) && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Gender:</span>
                  <span className="col-span-3">
                    {getPropertyFromFilterTags(selectedEvent.filterTags, 'gender')}
                  </span>
                </div>
              )}

              {/* Get venues from filterTags */}
              {selectedEvent.filterTags?.some(tag => tag.startsWith('venue:')) && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Location:</span>
                  <span className="col-span-3">
                    {selectedEvent.filterTags
                      .filter(tag => tag.startsWith('venue:'))
                      .map(tag => tag.split(':')[1])
                      .join(', ')}
                  </span>
                </div>
              )}

              {selectedEvent.filterTags?.some(tag => tag.startsWith('activity:')) && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Activity:</span>
                  <span className="col-span-3">
                    {getPropertyFromFilterTags(selectedEvent.filterTags, 'activity')}
                  </span>
                </div>
              )}

              {selectedEvent.categories && selectedEvent.categories.length > 0 && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Categories:</span>
                  <span className="col-span-3">{selectedEvent.categories.join(', ')}</span>
                </div>
              )}

              {selectedEvent.filterTags?.some(tag => tag.startsWith('match:')) && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Match:</span>
                  <span className="col-span-3">
                    {getPropertyFromFilterTags(selectedEvent.filterTags, 'match')}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-2">
                <span className="text-sm font-medium">Start:</span>
                <span className="col-span-3">
                  {moment(selectedEvent.start).format('MMMM D, YYYY h:mm A')}
                </span>
              </div>

              <div className="grid grid-cols-4 items-center gap-2">
                <span className="text-sm font-medium">End:</span>
                <span className="col-span-3">
                  {moment(selectedEvent.end).format('MMMM D, YYYY h:mm A')}
                </span>
              </div>

              {selectedEvent.url && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Link:</span>
                  <a
                    href={selectedEvent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-3 text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Open external link
                  </a>
                </div>
              )}

              {selectedEvent.description && (
                <div className="grid grid-cols-4 items-start gap-2">
                  <span className="text-sm font-medium">Description:</span>
                  <div className="col-span-3 text-sm">{selectedEvent.description}</div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4">
              {selectedEvent.url && (
                <Button variant="outline" onClick={() => window.open(selectedEvent.url, '_blank')}>
                  Open Link
                </Button>
              )}
              <Button variant="outline" onClick={closeDialog} className="ml-auto">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamCalendar;

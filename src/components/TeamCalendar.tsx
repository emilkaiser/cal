'use client';

import { useState, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { CalendarEvent as BaseCalendarEvent } from '../types/types';
import { DataSource } from '@/lib/data-sources';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getPropertyFromFilterTags } from '@/scrapers/utils/calendar-utils';
import { useEventFilters } from '@/hooks/useEventFilters';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getEventStyle, getDataSourceColor, getCalendarEventStyle } from '@/lib/color-utils';

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
  const [view, setView] = useState<View>(Views.WEEK);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterExpanded, setFilterExpanded] = useState(false);

  // Use our new custom hook for all filtering
  const filters = useEventFilters(events, dataSources);

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

  return (
    <div className="space-y-4">
      <div className="filter-controls rounded-lg border shadow-sm p-4">
        <Button onClick={toggleFilters} variant="outline" className="mb-2 w-full">
          {filterExpanded ? 'Hide Filters' : 'Show Filters'}
        </Button>

        {filterExpanded && (
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="sources">
              <AccordionTrigger className="text-md font-semibold">Data Sources</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                  <div className="col-span-full mb-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => filters.toggleAllDataSources(true)}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => filters.toggleAllDataSources(false)}
                    >
                      Deselect All
                    </Button>
                  </div>

                  {dataSources.map(source => (
                    <div key={source.id} className="flex items-center space-x-2">
                      <Switch
                        id={`source-${source.id}`}
                        checked={filters.enabledSources[source.id]}
                        onCheckedChange={() => filters.toggleDataSource(source.id)}
                      />
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 mr-2 rounded-full border border-gray-300"
                          style={{
                            backgroundColor: source.color || getDataSourceColor(source.id),
                          }}
                        />
                        <Label htmlFor={`source-${source.id}`}>{source.name}</Label>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Laget Teams */}
            {filters.hasLagetData && filters.lagetTeams.length > 0 && (
              <AccordionItem value="laget-teams">
                <AccordionTrigger className="text-md font-semibold">Laget Teams</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    <div className="col-span-full mb-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllLagetTeams(true)}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllLagetTeams(false)}
                      >
                        Deselect All
                      </Button>
                    </div>

                    {filters.lagetTeams.map(team => (
                      <div key={team} className="flex items-center space-x-2">
                        <Switch
                          id={`laget-team-${team}`}
                          checked={filters.enabledLagetTeams[team]}
                          onCheckedChange={() => filters.toggleLagetTeam(team)}
                        />
                        <Label htmlFor={`laget-team-${team}`}>{team}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Venue Teams */}
            {filters.hasVenueData && filters.venueTeams.length > 0 && (
              <AccordionItem value="venue-teams">
                <AccordionTrigger className="text-md font-semibold">Venue Teams</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    <div className="col-span-full mb-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllVenueTeams(true)}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllVenueTeams(false)}
                      >
                        Deselect All
                      </Button>
                    </div>

                    {filters.venueTeams.map(team => (
                      <div key={team} className="flex items-center space-x-2">
                        <Switch
                          id={`venue-team-${team}`}
                          checked={filters.enabledVenueTeams[team]}
                          onCheckedChange={() => filters.toggleVenueTeam(team)}
                        />
                        <Label htmlFor={`venue-team-${team}`}>{team}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Other Teams */}
            {filters.otherTeams.length > 0 && (
              <AccordionItem value="other-teams">
                <AccordionTrigger className="text-md font-semibold">Other Teams</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    <div className="col-span-full mb-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllOtherTeams(true)}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllOtherTeams(false)}
                      >
                        Deselect All
                      </Button>
                    </div>

                    {filters.otherTeams.map(team => (
                      <div key={team} className="flex items-center space-x-2">
                        <Switch
                          id={`other-team-${team}`}
                          checked={filters.enabledOtherTeams[team]}
                          onCheckedChange={() => filters.toggleOtherTeam(team)}
                        />
                        <Label htmlFor={`other-team-${team}`}>{team}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Undefined Teams */}
            {filters.hasUndefinedTeams && (
              <AccordionItem value="undefined-teams">
                <AccordionTrigger className="text-md font-semibold">
                  Events without Teams
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="undefined-teams"
                      checked={filters.showUndefinedTeams}
                      onCheckedChange={filters.toggleUndefinedTeams}
                    />
                    <Label htmlFor="undefined-teams">Show events without team assignment</Label>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Laget Venues */}
            {filters.hasLagetData && filters.lagetVenues.length > 0 && (
              <AccordionItem value="laget-venues">
                <AccordionTrigger className="text-md font-semibold">Laget Venues</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    <div className="col-span-full mb-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllLagetVenues(true)}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllLagetVenues(false)}
                      >
                        Deselect All
                      </Button>
                    </div>

                    {filters.lagetVenues.map(venue => (
                      <div key={venue} className="flex items-center space-x-2">
                        <Switch
                          id={`laget-venue-${venue}`}
                          checked={filters.enabledLagetVenues[venue]}
                          onCheckedChange={() => filters.toggleLagetVenue(venue)}
                        />
                        <Label htmlFor={`laget-venue-${venue}`}>{venue}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Venue Venues */}
            {filters.hasVenueData && filters.venueVenues.length > 0 && (
              <AccordionItem value="venue-venues">
                <AccordionTrigger className="text-md font-semibold">Venue Venues</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    <div className="col-span-full mb-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllVenueVenues(true)}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllVenueVenues(false)}
                      >
                        Deselect All
                      </Button>
                    </div>

                    {filters.venueVenues.map(venue => (
                      <div key={venue} className="flex items-center space-x-2">
                        <Switch
                          id={`venue-venue-${venue}`}
                          checked={filters.enabledVenueVenues[venue]}
                          onCheckedChange={() => filters.toggleVenueVenue(venue)}
                        />
                        <Label htmlFor={`venue-venue-${venue}`}>{venue}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Laget Activities */}
            {filters.hasLagetData && filters.lagetActivities.length > 0 && (
              <AccordionItem value="laget-activities">
                <AccordionTrigger className="text-md font-semibold">
                  Laget Activities
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    <div className="col-span-full mb-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllLagetActivities(true)}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllLagetActivities(false)}
                      >
                        Deselect All
                      </Button>
                    </div>

                    {filters.lagetActivities.map(activity => (
                      <div key={activity} className="flex items-center space-x-2">
                        <Switch
                          id={`laget-activity-${activity}`}
                          checked={filters.enabledLagetActivities[activity]}
                          onCheckedChange={() => filters.toggleLagetActivity(activity)}
                        />
                        <Label htmlFor={`laget-activity-${activity}`}>{activity}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Venue Activities */}
            {filters.hasVenueData && filters.venueActivities.length > 0 && (
              <AccordionItem value="venue-activities">
                <AccordionTrigger className="text-md font-semibold">
                  Venue Activities
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    <div className="col-span-full mb-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllVenueActivities(true)}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllVenueActivities(false)}
                      >
                        Deselect All
                      </Button>
                    </div>

                    {filters.venueActivities.map(activity => (
                      <div key={activity} className="flex items-center space-x-2">
                        <Switch
                          id={`venue-activity-${activity}`}
                          checked={filters.enabledVenueActivities[activity]}
                          onCheckedChange={() => filters.toggleVenueActivity(activity)}
                        />
                        <Label htmlFor={`venue-activity-${activity}`}>{activity}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Laget Match Locations */}
            {filters.hasLagetData && filters.lagetMatchLocations.length > 0 && (
              <AccordionItem value="laget-match-locations">
                <AccordionTrigger className="text-md font-semibold">
                  Laget: Home/Away
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    <div className="col-span-full mb-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllLagetMatchLocations(true)}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllLagetMatchLocations(false)}
                      >
                        Deselect All
                      </Button>
                    </div>

                    {filters.lagetMatchLocations.map(location => (
                      <div key={location} className="flex items-center space-x-2">
                        <Switch
                          id={`laget-location-${location}`}
                          checked={filters.enabledLagetMatchLocations[location]}
                          onCheckedChange={() => filters.toggleLagetMatchLocation(location)}
                        />
                        <Label htmlFor={`laget-location-${location}`}>
                          {getMatchLocationLabel(location)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Venue Match Locations */}
            {filters.hasVenueData && filters.venueMatchLocations.length > 0 && (
              <AccordionItem value="venue-match-locations">
                <AccordionTrigger className="text-md font-semibold">
                  Venue: Home/Away
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    <div className="col-span-full mb-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllVenueMatchLocations(true)}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => filters.toggleAllVenueMatchLocations(false)}
                      >
                        Deselect All
                      </Button>
                    </div>

                    {filters.venueMatchLocations.map(location => (
                      <div key={location} className="flex items-center space-x-2">
                        <Switch
                          id={`venue-location-${location}`}
                          checked={filters.enabledVenueMatchLocations[location]}
                          onCheckedChange={() => filters.toggleVenueMatchLocation(location)}
                        />
                        <Label htmlFor={`venue-location-${location}`}>
                          {getMatchLocationLabel(location)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </div>

      <div
        className="calendar-container rounded-lg border shadow-sm overflow-hidden"
        style={{ height: '800px' }}
      >
        <Calendar
          localizer={localizer}
          events={filters.filteredEvents}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={(event: CalendarEvent) => ({
            style: getCalendarEventStyle(event.source ? event.source.toLowerCase() : undefined),
          })}
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
              {(selectedEvent.team ||
                selectedEvent.filterTags?.some(tag => tag.startsWith('team:'))) && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Team:</span>
                  <span className="col-span-3">
                    {selectedEvent.team || selectedEvent.filterTags
                      ? getPropertyFromFilterTags(selectedEvent.filterTags, 'team')
                      : ''}
                  </span>
                </div>
              )}

              {selectedEvent.ageGroup && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Age Group:</span>
                  <span className="col-span-3">{selectedEvent.ageGroup}</span>
                </div>
              )}

              {selectedEvent.gender && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Gender:</span>
                  <span className="col-span-3">{selectedEvent.gender}</span>
                </div>
              )}

              {selectedEvent.activity && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Activity:</span>
                  <span className="col-span-3">{selectedEvent.activity}</span>
                </div>
              )}

              {selectedEvent.match && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Match:</span>
                  <span className="col-span-3">{selectedEvent.match}</span>
                </div>
              )}

              {selectedEvent.categories && selectedEvent.categories.length > 0 && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Categories:</span>
                  <span className="col-span-3">{selectedEvent.categories.join(', ')}</span>
                </div>
              )}

              {selectedEvent.venues && selectedEvent.venues.length > 0 && (
                <div className="grid grid-cols-4 items-start gap-2">
                  <span className="text-sm font-medium">Venue:</span>
                  <span className="col-span-3">{selectedEvent.venues.join(', ')}</span>
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

              {selectedEvent.source && (
                <div className="grid grid-cols-4 items-center gap-2">
                  <span className="text-sm font-medium">Source:</span>
                  <span className="col-span-3">
                    {dataSources.find(s => s.id === selectedEvent.source)?.name ||
                      selectedEvent.source}
                  </span>
                </div>
              )}

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
                  <div className="col-span-3 text-sm whitespace-pre-line">
                    {selectedEvent.description}
                  </div>
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

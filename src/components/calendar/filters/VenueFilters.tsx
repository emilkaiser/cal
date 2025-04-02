'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { DataSource } from '@/lib/data-sources';
import { useMemo } from 'react';

interface VenueFiltersProps {
  filters: any;
  dataSources?: DataSource[];
}

export const VenueFilters = ({ filters, dataSources = [] }: VenueFiltersProps) => {
  // Create a mapping of venues to their source colors
  const venueSourceMap = useMemo(() => {
    const map: Record<string, { color: string; count: number }> = {};

    if (filters.lagetVenues && filters.lagetVenues.length > 0) {
      const lagetSource = dataSources.find(source => source.id === 'laget');
      filters.lagetVenues.forEach((venue: string) => {
        // Count events for this venue
        const eventCount =
          filters.filteredEvents?.filter(
            (event: any) => event.source === 'laget' && event.venues?.includes(venue)
          ).length || 0;

        map[venue] = {
          color: lagetSource?.color || 'hsl(210, 70%, 50%)',
          count: eventCount,
        };
      });
    }

    if (filters.venueVenues && filters.venueVenues.length > 0) {
      filters.venueVenues.forEach((venue: string) => {
        // Find which venue source this venue belongs to
        let sourceColor = 'hsl(0, 0%, 70%)';
        let eventCount = 0;

        dataSources.forEach(source => {
          if (source.id.startsWith('venue-')) {
            const sourceEvents =
              filters.filteredEvents?.filter(
                (event: any) => event.source === source.id && event.venues?.includes(venue)
              ) || [];

            if (sourceEvents.length > 0) {
              sourceColor = source.color;
              eventCount += sourceEvents.length;
            }
          }
        });

        map[venue] = { color: sourceColor, count: eventCount };
      });
    }

    return map;
  }, [filters, dataSources]);

  // Combine all venues for display
  const allVenues = useMemo(() => {
    const venueSet = new Set<string>();
    if (filters.lagetVenues) filters.lagetVenues.forEach((v: string) => venueSet.add(v));
    if (filters.venueVenues) filters.venueVenues.forEach((v: string) => venueSet.add(v));
    return Array.from(venueSet).sort();
  }, [filters.lagetVenues, filters.venueVenues]);

  // Helper function to toggle the right venue based on its source
  const toggleVenue = (venue: string) => {
    if (filters.lagetVenues?.includes(venue)) {
      filters.toggleLagetVenue(venue);
    } else if (filters.venueVenues?.includes(venue)) {
      filters.toggleVenueVenue(venue);
    }
  };

  // Helper function to check if venue is enabled
  const isVenueEnabled = (venue: string) => {
    if (filters.lagetVenues?.includes(venue)) {
      return filters.enabledLagetVenues?.[venue] ?? false;
    } else if (filters.venueVenues?.includes(venue)) {
      return filters.enabledVenueVenues?.[venue] ?? false;
    }
    return false;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (filters.toggleAllLagetVenues) filters.toggleAllLagetVenues(true);
            if (filters.toggleAllVenueVenues) filters.toggleAllVenueVenues(true);
          }}
        >
          Select All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (filters.toggleAllLagetVenues) filters.toggleAllLagetVenues(false);
            if (filters.toggleAllVenueVenues) filters.toggleAllVenueVenues(false);
          }}
        >
          Deselect All
        </Button>
      </div>
      <ScrollArea className="h-60">
        <div className="space-y-2">
          {allVenues.map((venue: string) => {
            const sourceInfo = venueSourceMap[venue];
            return (
              <div key={venue} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: sourceInfo?.color || 'transparent' }}
                />
                <Switch
                  id={`venue-${venue}`}
                  checked={isVenueEnabled(venue)}
                  onCheckedChange={() => toggleVenue(venue)}
                />
                <div className="flex flex-1 items-center justify-between">
                  <Label htmlFor={`venue-${venue}`} className="cursor-pointer">
                    {venue}
                  </Label>
                  {sourceInfo?.count > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {sourceInfo.count}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

'use client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ActivityFiltersProps {
  filters: any;
  getMatchLocationLabel: (location: string) => string;
}

export const ActivityFilters = ({ filters, getMatchLocationLabel }: ActivityFiltersProps) => {
  // Calculate counts for activities across all sources
  const activityCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    // Combine both laget and venue activities
    const allActivities = [...(filters.lagetActivities || []), ...(filters.venueActivities || [])];
    const uniqueActivities = [...new Set(allActivities)];

    uniqueActivities.forEach(activity => {
      // Count events with this activity that pass other filters
      counts[activity] =
        filters.filteredEvents?.filter((event: any) => event.activity === activity).length || 0;
    });

    return counts;
  }, [filters.filteredEvents, filters.lagetActivities, filters.venueActivities]);

  // Calculate counts for match locations across all sources
  const matchLocationCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    // Combine both laget and venue match locations
    const allMatchLocations = [
      ...(filters.lagetMatchLocations || []),
      ...(filters.venueMatchLocations || []),
    ];
    const uniqueMatchLocations = [...new Set(allMatchLocations)];

    uniqueMatchLocations.forEach(location => {
      // Count events with this match location that pass other filters
      counts[location] =
        filters.filteredEvents?.filter((event: any) => {
          if (event.match && event.match.toLowerCase() === location.toLowerCase()) {
            return true;
          }
          // For venue events without explicit match location, count them as "home" by default
          if (
            location === 'home' &&
            event.source &&
            event.source.startsWith('venue') &&
            !event.match
          ) {
            return true;
          }
          return false;
        }).length || 0;
    });

    return counts;
  }, [filters.filteredEvents, filters.lagetMatchLocations, filters.venueMatchLocations]);

  // Combine activities from both sources for display
  const allActivities = useMemo(() => {
    const activitiesSet = new Set<string>();

    // Add laget activities
    if (filters.lagetActivities) {
      filters.lagetActivities.forEach((activity: string) => activitiesSet.add(activity));
    }

    // Add venue activities
    if (filters.venueActivities) {
      filters.venueActivities.forEach((activity: string) => activitiesSet.add(activity));
    }

    return Array.from(activitiesSet).sort();
  }, [filters.lagetActivities, filters.venueActivities]);

  // Combine match locations from both sources for display
  const allMatchLocations = useMemo(() => {
    const locationsSet = new Set<string>();

    // Add laget match locations
    if (filters.lagetMatchLocations) {
      filters.lagetMatchLocations.forEach((location: string) => locationsSet.add(location));
    }

    // Add venue match locations
    if (filters.venueMatchLocations) {
      filters.venueMatchLocations.forEach((location: string) => locationsSet.add(location));
    }

    return Array.from(locationsSet).sort();
  }, [filters.lagetMatchLocations, filters.venueMatchLocations]);

  // Helper to toggle the appropriate activity based on source
  const toggleActivity = (activity: string) => {
    if (filters.lagetActivities && filters.lagetActivities.includes(activity)) {
      filters.toggleLagetActivity(activity);
    }
    if (filters.venueActivities && filters.venueActivities.includes(activity)) {
      filters.toggleVenueActivity(activity);
    }
  };

  // Helper to check if activity is enabled
  const isActivityEnabled = (activity: string) => {
    const inLaget = filters.lagetActivities && filters.lagetActivities.includes(activity);
    const inVenue = filters.venueActivities && filters.venueActivities.includes(activity);

    if (inLaget && !filters.enabledLagetActivities[activity]) return false;
    if (inVenue && !filters.enabledVenueActivities[activity]) return false;

    return true;
  };

  // Helper to toggle the appropriate match location based on source
  const toggleMatchLocation = (location: string) => {
    if (filters.lagetMatchLocations && filters.lagetMatchLocations.includes(location)) {
      filters.toggleLagetMatchLocation(location);
    }
    if (filters.venueMatchLocations && filters.venueMatchLocations.includes(location)) {
      filters.toggleVenueMatchLocation(location);
    }
  };

  // Helper to check if match location is enabled
  const isMatchLocationEnabled = (location: string) => {
    const inLaget = filters.lagetMatchLocations && filters.lagetMatchLocations.includes(location);
    const inVenue = filters.venueMatchLocations && filters.venueMatchLocations.includes(location);

    if (inLaget && !filters.enabledLagetMatchLocations[location]) return false;
    if (inVenue && !filters.enabledVenueMatchLocations[location]) return false;

    return true;
  };

  // Toggle all activities
  const toggleAllActivities = (enabled: boolean) => {
    if (filters.toggleAllLagetActivities) {
      filters.toggleAllLagetActivities(enabled);
    }
    if (filters.toggleAllVenueActivities) {
      filters.toggleAllVenueActivities(enabled);
    }
  };

  // Toggle all match locations
  const toggleAllMatchLocations = (enabled: boolean) => {
    if (filters.toggleAllLagetMatchLocations) {
      filters.toggleAllLagetMatchLocations(enabled);
    }
    if (filters.toggleAllVenueMatchLocations) {
      filters.toggleAllVenueMatchLocations(enabled);
    }
  };

  // Check if we have activities or match locations
  const hasActivities = allActivities.length > 0;
  const hasMatchLocations = allMatchLocations.length > 0;

  // Only show if we have content to display
  if (!hasActivities && !hasMatchLocations) {
    return <div className="text-muted-foreground text-sm">No activity filters available.</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="activities">Activity Types</TabsTrigger>
          <TabsTrigger value="locations">Match Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="pt-4">
          {hasActivities ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="outline" size="sm" onClick={() => toggleAllActivities(true)}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleAllActivities(false)}>
                  Deselect All
                </Button>
              </div>
              <ScrollArea className="h-60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {allActivities.map((activity: string) => (
                    <div key={activity} className="flex items-center space-x-2">
                      <Switch
                        id={`activity-${activity}`}
                        checked={isActivityEnabled(activity)}
                        onCheckedChange={() => toggleActivity(activity)}
                      />
                      <div className="flex flex-1 items-center justify-between">
                        <Label htmlFor={`activity-${activity}`} className="cursor-pointer">
                          {activity}
                        </Label>
                        {activityCounts[activity] > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {activityCounts[activity]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">No activity types available.</div>
          )}
        </TabsContent>

        <TabsContent value="locations" className="pt-4">
          {hasMatchLocations ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="outline" size="sm" onClick={() => toggleAllMatchLocations(true)}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleAllMatchLocations(false)}>
                  Deselect All
                </Button>
              </div>
              <ScrollArea className="h-60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {allMatchLocations.map((location: string) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Switch
                        id={`location-${location}`}
                        checked={isMatchLocationEnabled(location)}
                        onCheckedChange={() => toggleMatchLocation(location)}
                      />
                      <div className="flex flex-1 items-center justify-between">
                        <Label htmlFor={`location-${location}`} className="cursor-pointer">
                          {getMatchLocationLabel(location)}
                        </Label>
                        {matchLocationCounts[location] > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {matchLocationCounts[location]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">No match locations available.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

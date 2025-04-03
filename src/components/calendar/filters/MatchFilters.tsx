'use client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { MATCH_HOME, MATCH_AWAY, MATCH_EXTERNAL } from '@/types/types';

interface MatchFiltersProps {
  filters: any;
}

export const MatchFilters = ({ filters }: MatchFiltersProps) => {
  // Calculate counts for match types across all sources
  const matchTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      [MATCH_HOME.toLowerCase()]: 0,
      [MATCH_AWAY.toLowerCase()]: 0,
      [MATCH_EXTERNAL.toLowerCase()]: 0,
    };

    // Count events with each match type that pass other filters
    if (filters.filteredEvents) {
      filters.filteredEvents.forEach((event: any) => {
        if (event.match) {
          const matchType = event.match.toLowerCase();
          if (counts[matchType] !== undefined) {
            counts[matchType]++;
          }
        }
      });
    }

    return counts;
  }, [filters.filteredEvents]);

  // Combine match types from both sources for display
  const matchTypes = useMemo(() => {
    return [MATCH_HOME.toLowerCase(), MATCH_AWAY.toLowerCase(), MATCH_EXTERNAL.toLowerCase()];
  }, []);

  // Helper to toggle the appropriate match type based on source
  const toggleMatchType = (matchType: string) => {
    if (filters.lagetMatchLocations && filters.lagetMatchLocations.includes(matchType)) {
      filters.toggleLagetMatchLocation(matchType);
    }
    if (filters.venueMatchLocations && filters.venueMatchLocations.includes(matchType)) {
      filters.toggleVenueMatchLocation(matchType);
    }
  };

  // Helper to check if match type is enabled
  const isMatchTypeEnabled = (matchType: string) => {
    const inLaget = filters.lagetMatchLocations && filters.lagetMatchLocations.includes(matchType);
    const inVenue = filters.venueMatchLocations && filters.venueMatchLocations.includes(matchType);

    if (inLaget && !filters.enabledLagetMatchLocations[matchType]) return false;
    if (inVenue && !filters.enabledVenueMatchLocations[matchType]) return false;

    return true;
  };

  // Toggle all match types
  const toggleAllMatchTypes = (enabled: boolean) => {
    if (filters.toggleAllLagetMatchLocations) {
      filters.toggleAllLagetMatchLocations(enabled);
    }
    if (filters.toggleAllVenueMatchLocations) {
      filters.toggleAllVenueMatchLocations(enabled);
    }
  };

  // Get match type label
  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case MATCH_HOME.toLowerCase():
        return 'Home';
      case MATCH_AWAY.toLowerCase():
        return 'Away';
      case MATCH_EXTERNAL.toLowerCase():
        return 'External';
      default:
        return matchType.charAt(0).toUpperCase() + matchType.slice(1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="outline" size="sm" onClick={() => toggleAllMatchTypes(true)}>
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleAllMatchTypes(false)}>
          Deselect All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {matchTypes.map(matchType => (
          <div key={matchType} className="flex items-center space-x-2">
            <Switch
              id={`match-type-${matchType}`}
              checked={isMatchTypeEnabled(matchType)}
              onCheckedChange={() => toggleMatchType(matchType)}
            />
            <div className="flex flex-1 items-center justify-between">
              <Label htmlFor={`match-type-${matchType}`} className="cursor-pointer">
                {getMatchTypeLabel(matchType)}
              </Label>
              {matchTypeCounts[matchType] > 0 && (
                <Badge variant="outline" className="ml-2">
                  {matchTypeCounts[matchType]}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

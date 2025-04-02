'use client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { DataSource } from '@/lib/data-sources';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeamFiltersProps {
  filters: any;
  dataSources?: DataSource[];
}

export const TeamFilters = ({ filters, dataSources = [] }: TeamFiltersProps) => {
  // Calculate counts for Laget teams
  const lagetTeamCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    if (filters.lagetTeams && filters.lagetTeams.length > 0) {
      filters.lagetTeams.forEach((team: string) => {
        // Count events for this team based on active filters
        counts[team] =
          filters.filteredEvents?.filter(
            (event: any) => event.source === 'laget' && event.team === team
          ).length || 0;
      });
    }

    return counts;
  }, [filters.lagetTeams, filters.filteredEvents]);

  // Calculate counts for Venue teams
  const venueTeamCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    if (filters.venueTeams && filters.venueTeams.length > 0) {
      filters.venueTeams.forEach((team: string) => {
        // Count events for this team based on active filters
        counts[team] =
          filters.filteredEvents?.filter(
            (event: any) => event.source && event.source.startsWith('venue') && event.team === team
          ).length || 0;
      });
    }

    return counts;
  }, [filters.venueTeams, filters.filteredEvents]);

  // Calculate counts for Other teams
  const otherTeamCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    if (filters.otherTeams && filters.otherTeams.length > 0) {
      filters.otherTeams.forEach((team: string) => {
        // Count events for this team based on active filters
        counts[team] =
          filters.filteredEvents?.filter(
            (event: any) =>
              event.source !== 'laget' &&
              !(event.source && event.source.startsWith('venue')) &&
              event.team === team
          ).length || 0;
      });
    }

    return counts;
  }, [filters.otherTeams, filters.filteredEvents]);

  // Determine which tabs to show based on available data
  const tabs = useMemo(() => {
    const availableTabs = [];
    if (filters.hasLagetData && filters.lagetTeams.length > 0) {
      availableTabs.push('laget');
    }
    if (filters.hasVenueData && filters.venueTeams.length > 0) {
      availableTabs.push('venue');
    }
    if (filters.otherTeams.length > 0) {
      availableTabs.push('other');
    }
    return availableTabs;
  }, [
    filters.hasLagetData,
    filters.hasVenueData,
    filters.lagetTeams,
    filters.venueTeams,
    filters.otherTeams,
  ]);

  const defaultTab = tabs.length > 0 ? tabs[0] : '';

  return (
    <div className="space-y-4">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList
          className="w-full grid"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
        >
          {filters.hasLagetData && filters.lagetTeams.length > 0 && (
            <TabsTrigger value="laget">Laget Teams</TabsTrigger>
          )}
          {filters.hasVenueData && filters.venueTeams.length > 0 && (
            <TabsTrigger value="venue">Venue Teams</TabsTrigger>
          )}
          {filters.otherTeams.length > 0 && <TabsTrigger value="other">Other Teams</TabsTrigger>}
        </TabsList>

        {filters.hasLagetData && filters.lagetTeams.length > 0 && (
          <TabsContent value="laget" className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
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
              <ScrollArea className="h-60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filters.lagetTeams.map((team: string) => (
                    <div key={team} className="flex items-center space-x-2">
                      <Switch
                        id={`laget-team-${team}`}
                        checked={filters.enabledLagetTeams[team]}
                        onCheckedChange={() => filters.toggleLagetTeam(team)}
                      />
                      <div className="flex flex-1 items-center justify-between">
                        <Label htmlFor={`laget-team-${team}`} className="cursor-pointer">
                          {team}
                        </Label>
                        {lagetTeamCounts[team] > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {lagetTeamCounts[team]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        )}

        {filters.hasVenueData && filters.venueTeams.length > 0 && (
          <TabsContent value="venue" className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
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
              <ScrollArea className="h-60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filters.venueTeams.map((team: string) => (
                    <div key={team} className="flex items-center space-x-2">
                      <Switch
                        id={`venue-team-${team}`}
                        checked={filters.enabledVenueTeams[team]}
                        onCheckedChange={() => filters.toggleVenueTeam(team)}
                      />
                      <div className="flex flex-1 items-center justify-between">
                        <Label htmlFor={`venue-team-${team}`} className="cursor-pointer">
                          {team}
                        </Label>
                        {venueTeamCounts[team] > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {venueTeamCounts[team]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        )}

        {filters.otherTeams.length > 0 && (
          <TabsContent value="other" className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
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
              <ScrollArea className="h-60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filters.otherTeams.map((team: string) => (
                    <div key={team} className="flex items-center space-x-2">
                      <Switch
                        id={`other-team-${team}`}
                        checked={filters.enabledOtherTeams[team]}
                        onCheckedChange={() => filters.toggleOtherTeam(team)}
                      />
                      <div className="flex flex-1 items-center justify-between">
                        <Label htmlFor={`other-team-${team}`} className="cursor-pointer">
                          {team}
                        </Label>
                        {otherTeamCounts[team] > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {otherTeamCounts[team]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

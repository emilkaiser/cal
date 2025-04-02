'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { DataSource } from '@/lib/data-sources';
import { DataSourceFilters } from './DataSourceFilters';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ExpandedFilterAccordionProps {
  filters: any;
  dataSources: DataSource[];
}

export const ExpandedFilterAccordion = ({ filters, dataSources }: ExpandedFilterAccordionProps) => {
  return (
    <Accordion type="multiple" className="w-full">
      {/* Data Sources */}
      <AccordionItem value="sources">
        <AccordionTrigger className="text-md font-semibold">Data Sources</AccordionTrigger>
        <AccordionContent>
          <DataSourceFilters filters={filters} dataSources={dataSources} isExpanded />
        </AccordionContent>
      </AccordionItem>

      {/* Laget Teams */}
      {filters.hasLagetData && filters.lagetTeams.length > 0 && (
        <AccordionItem value="laget-teams">
          <AccordionTrigger className="text-md font-semibold">Laget Teams</AccordionTrigger>
          <AccordionContent>
            <LagetTeamFilters filters={filters} />
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Venue Teams */}
      {filters.hasVenueData && filters.venueTeams.length > 0 && (
        <AccordionItem value="venue-teams">
          <AccordionTrigger className="text-md font-semibold">Venue Teams</AccordionTrigger>
          <AccordionContent>
            <VenueTeamFilters filters={filters} />
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Other Teams */}
      {filters.otherTeams.length > 0 && (
        <AccordionItem value="other-teams">
          <AccordionTrigger className="text-md font-semibold">Other Teams</AccordionTrigger>
          <AccordionContent>
            <OtherTeamFilters filters={filters} />
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Venues */}
      <AccordionItem value="venues">
        <AccordionTrigger className="text-md font-semibold">Venues</AccordionTrigger>
        <AccordionContent>
          <VenuesExpandedFilters filters={filters} />
        </AccordionContent>
      </AccordionItem>

      {/* Activities */}
      <AccordionItem value="activities">
        <AccordionTrigger className="text-md font-semibold">Activities</AccordionTrigger>
        <AccordionContent>
          <ActivitiesExpandedFilters filters={filters} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

interface LagetTeamFiltersProps {
  filters: any;
}

const LagetTeamFilters = ({ filters }: LagetTeamFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
      <div className="col-span-full mb-2 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => filters.toggleAllLagetTeams(true)}>
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={() => filters.toggleAllLagetTeams(false)}>
          Deselect All
        </Button>
      </div>
      {filters.lagetTeams.map((team: string) => (
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
  );
};

// Export other filter components that would be needed
// This is just a placeholder, but would contain similar implementation for each filter type

const VenueTeamFilters = ({ filters }: { filters: any }) => {
  // Implementation similar to LagetTeamFilters but for venue teams
  return null;
};

const OtherTeamFilters = ({ filters }: { filters: any }) => {
  // Implementation for other teams
  return null;
};

const VenuesExpandedFilters = ({ filters }: { filters: any }) => {
  // Implementation for venues in expanded mode
  return null;
};

const ActivitiesExpandedFilters = ({ filters }: { filters: any }) => {
  // Implementation for activities in expanded mode
  return null;
};

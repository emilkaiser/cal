'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataSource } from '@/lib/data-sources';
import { DataSourceFilters } from './DataSourceFilters';
import { TeamFilters } from './TeamFilters';
import { VenueFilters } from './VenueFilters';
import { ActivityFilters } from './ActivityFilters';
import { MatchFilters } from './MatchFilters';

interface CompactFilterTabsProps {
  filters: any;
  dataSources: DataSource[];
  getMatchLocationLabel: (location: string) => string;
}

export const CompactFilterTabs = ({
  filters,
  dataSources,
  getMatchLocationLabel,
}: CompactFilterTabsProps) => {
  return (
    <Tabs defaultValue="sources" className="w-full">
      <TabsList className="mb-2 grid grid-cols-2 md:grid-cols-5 h-auto">
        <TabsTrigger value="sources" className="text-xs py-2">
          Data Sources
        </TabsTrigger>
        <TabsTrigger value="teams" className="text-xs py-2">
          Teams
        </TabsTrigger>
        <TabsTrigger value="venues" className="text-xs py-2">
          Venues
        </TabsTrigger>
        <TabsTrigger value="activities" className="text-xs py-2">
          Activities
        </TabsTrigger>
        <TabsTrigger value="matches" className="text-xs py-2">
          Matches
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sources" className="border rounded-md p-3">
        <ScrollArea className="h-60">
          <DataSourceFilters filters={filters} dataSources={dataSources} />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="teams" className="border rounded-md p-3">
        <ScrollArea className="h-60">
          <TeamFilters filters={filters} />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="venues" className="border rounded-md p-3">
        <ScrollArea className="h-60">
          <VenueFilters filters={filters} dataSources={dataSources} />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="activities" className="border rounded-md p-3">
        <ScrollArea className="h-60">
          <ActivityFilters filters={filters} getMatchLocationLabel={getMatchLocationLabel} />
        </ScrollArea>
      </TabsContent>

      <TabsContent value="matches" className="border rounded-md p-3">
        <ScrollArea className="h-60">
          <MatchFilters filters={filters} />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

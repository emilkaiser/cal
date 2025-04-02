'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sliders } from 'lucide-react';
import { DataSource } from '@/lib/data-sources';
import { CompactFilterTabs } from './filters/CompactFilterTabs';
import { Badge } from '@/components/ui/badge';

interface FiltersCardProps {
  filterExpanded: boolean;
  toggleFilters: () => void;
  filters: any; // Using any for simplicity, should be properly typed
  dataSources: DataSource[];
  getMatchLocationLabel: (location: string) => string;
  totalEvents: number;
}

export const FiltersCard = ({
  filterExpanded,
  toggleFilters,
  filters,
  dataSources,
  getMatchLocationLabel,
  totalEvents,
}: FiltersCardProps) => {
  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Filter Events</h3>
          <Badge variant="outline" className="ml-2">
            {totalEvents} events
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleFilters} className="h-8 px-3">
            {filterExpanded ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      {filterExpanded && (
        <div className="mb-4">
          <CompactFilterTabs
            filters={filters}
            dataSources={dataSources}
            getMatchLocationLabel={getMatchLocationLabel}
          />
        </div>
      )}
    </div>
  );
};

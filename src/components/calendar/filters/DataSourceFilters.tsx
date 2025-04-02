'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataSource } from '@/lib/data-sources';
import { getDataSourceColor } from '@/lib/color-utils';
import { useMemo } from 'react';

interface DataSourceFiltersProps {
  filters: any;
  dataSources: DataSource[];
  isExpanded?: boolean;
}

export const DataSourceFilters = ({ filters, dataSources, isExpanded }: DataSourceFiltersProps) => {
  // Calculate counts for each data source
  const dataSourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    dataSources.forEach(source => {
      // For each data source, count how many events are in the events array
      counts[source.id] =
        filters.filteredEvents?.filter((event: any) => event.source === source.id).length || 0;
    });

    return counts;
  }, [dataSources, filters.filteredEvents]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => filters.toggleAllDataSources(true)}>
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={() => filters.toggleAllDataSources(false)}>
          Deselect All
        </Button>
      </div>
      <div
        className={`grid grid-cols-1 ${isExpanded ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-3`}
      >
        {dataSources.map(source => (
          <div key={source.id} className="flex items-center space-x-2">
            <Switch
              id={`source-${source.id}`}
              checked={filters.enabledSources[source.id]}
              onCheckedChange={() => filters.toggleDataSource(source.id)}
            />
            <div className="flex flex-1 items-center justify-between">
              <Label
                htmlFor={`source-${source.id}`}
                className="font-medium cursor-pointer flex items-center gap-2"
              >
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: source.color || getDataSourceColor(source.id) }}
                />
                {source.name}
              </Label>
              {dataSourceCounts[source.id] > 0 && (
                <Badge variant="outline" className="ml-2">
                  {dataSourceCounts[source.id]}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

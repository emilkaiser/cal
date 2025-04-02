'use client';

import { useMemo } from 'react';
import moment from 'moment';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { getDataSourceColor } from '@/lib/color-utils';
import { FiltersCard } from './FiltersCard';
import type { CalendarEvent } from '@/types/types';
import { DataSource } from '@/lib/data-sources';

interface CalendarOverviewProps {
  stats: CalendarEvent[];
  setSelectedEvent: (event: CalendarEvent) => void;
  filterExpanded: boolean;
  toggleFilters: () => void;
  filters: any; // Using any for simplicity, should be properly typed
  dataSources: DataSource[];
  getMatchLocationLabel: (location: string) => string;
}

export const CalendarOverview = ({
  stats,
  setSelectedEvent,
  filterExpanded,
  toggleFilters,
  filters,
  dataSources,
  getMatchLocationLabel,
}: CalendarOverviewProps) => {
  // Only calculate total events, ignoring today and upcoming
  const total = stats.length;

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Statistics and data source legend */}
      <Card className="w-full md:w-1/3">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Calendar Overview</h3>
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col border rounded-lg p-3 mb-4">
            <span className="text-xs text-muted-foreground">Total Events</span>
            <span className="text-2xl font-bold">{total}</span>
          </div>

          {/* Data Source Legend */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Data Sources</h4>
            <div className="space-y-2">
              {dataSources.map(source => (
                <div key={source.id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: source.color || getDataSourceColor(source.id),
                    }}
                  />
                  <span className="text-sm">{source.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar filters card */}
      <FiltersCard
        filterExpanded={filterExpanded}
        toggleFilters={toggleFilters}
        filters={filters}
        dataSources={dataSources}
        getMatchLocationLabel={getMatchLocationLabel}
        totalEvents={total}
      />
    </div>
  );
};

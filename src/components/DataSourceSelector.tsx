'use client';

import React from 'react';
import { DataSource } from '@/lib/data-sources';
import { getFilterDisplayName } from '@/utils/filter-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface DataSourceSelectorProps {
  dataSources: DataSource[];
  selectedSources: string[];
  hiddenSources: string[];
  onSelectionChange: (selectedSources: string[]) => void;
  availableFiltersBySource: {
    [sourceId: string]: { [filterType: string]: string[] };
  };
  sourceFilters: { [sourceId: string]: string[] };
  onFilterChange: (sourceId: string, filters: string[]) => void;
  onToggleHiddenSource: (sourceId: string) => void;
  onClearSourceFilters: (sourceId: string) => void;
}

export function DataSourceSelector({
  dataSources,
  selectedSources,
  hiddenSources,
  onSelectionChange,
  availableFiltersBySource,
  sourceFilters,
  onFilterChange,
  onToggleHiddenSource,
  onClearSourceFilters,
}: DataSourceSelectorProps) {
  const toggleSource = (sourceId: string) => {
    if (selectedSources.includes(sourceId)) {
      onSelectionChange(selectedSources.filter(id => id !== sourceId));
    } else {
      onSelectionChange([...selectedSources, sourceId]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {dataSources.map(source => (
        <Card key={source.id} className="relative">
          <CardHeader className="pb-2">
            <div className="flex justify-between mb-1">
              <Checkbox
                id={`source-${source.id}`}
                checked={selectedSources.includes(source.id)}
                onCheckedChange={() => toggleSource(source.id)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => onToggleHiddenSource(source.id)}
              >
                {hiddenSources.includes(source.id) ? 'Show' : 'Hide'}
              </Button>
            </div>
            <CardTitle className="text-lg flex items-center gap-2">
              <label
                htmlFor={`source-${source.id}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: source.color }}
                ></div>
                {source.name}
                {hiddenSources.includes(source.id) && (
                  <Badge variant="outline" className="ml-2">
                    Hidden
                  </Badge>
                )}
              </label>
            </CardTitle>
            {/* Check if description exists before rendering */}
            {'description' in source && (
              <CardDescription>{source.description as string}</CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {Object.keys(availableFiltersBySource[source.id] || {}).map(filterType => (
              <div key={filterType} className="mb-4">
                <div className="text-sm font-medium mb-1">{getFilterDisplayName(filterType)}:</div>
                <Select
                  value={sourceFilters[source.id]
                    ?.filter(f => f.startsWith(`${filterType}:`))
                    .join(',')}
                  onValueChange={value => {
                    const currentFilters = sourceFilters[source.id] || [];
                    const updatedFilters = currentFilters.filter(
                      f => !f.startsWith(`${filterType}:`)
                    );

                    if (value) {
                      const selectedValues = value.split(',');
                      updatedFilters.push(...selectedValues);
                    }

                    onFilterChange(source.id, updatedFilters);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${getFilterDisplayName(filterType)}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFiltersBySource[source.id]?.[filterType]?.map((value: string) => (
                      <SelectItem key={`${filterType}:${value}`} value={`${filterType}:${value}`}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {sourceFilters[source.id]?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {sourceFilters[source.id].map(filter => {
                  const [type, value] = filter.split(':');
                  return (
                    <Badge
                      key={filter}
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {`${getFilterDisplayName(type)}: ${value}`}
                      <button
                        className="ml-1 text-xs rounded-full bg-muted w-4 h-4 inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => {
                          const updatedFilters = sourceFilters[source.id].filter(f => f !== filter);
                          onFilterChange(source.id, updatedFilters);
                        }}
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={() => onClearSourceFilters(source.id)}
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

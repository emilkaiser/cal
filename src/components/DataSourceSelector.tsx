'use client';

import React, { memo, useCallback } from 'react';
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

// Memoize individual source card to prevent unnecessary re-renders
const SourceCard = memo(
  ({
    source,
    isSelected,
    isHidden,
    availableFilters,
    sourceFilter,
    onToggleSource,
    onToggleHidden,
    onFilterChange,
    onClearSourceFilter,
  }: {
    source: DataSource;
    isSelected: boolean;
    isHidden: boolean;
    availableFilters: { [filterType: string]: string[] };
    sourceFilter: string[];
    onToggleSource: () => void;
    onToggleHidden: () => void;
    onFilterChange: (filters: string[]) => void;
    onClearSourceFilter: () => void;
  }) => {
    // Optimize filter change handler
    const handleFilterChange = useCallback(
      (filterType: string, value: string) => {
        const currentFilters = sourceFilter || [];
        const updatedFilters = currentFilters.filter(f => !f.startsWith(`${filterType}:`));

        if (value) {
          const selectedValues = value.split(',');
          updatedFilters.push(...selectedValues);
        }

        onFilterChange(updatedFilters);
      },
      [sourceFilter, onFilterChange]
    );

    // Optimize badge removal
    const handleRemoveFilter = useCallback(
      (filter: string) => {
        const updatedFilters = sourceFilter.filter(f => f !== filter);
        onFilterChange(updatedFilters);
      },
      [sourceFilter, onFilterChange]
    );

    return (
      <Card className="relative">
        <CardHeader className="pb-2">
          <div className="flex justify-between mb-1">
            <Checkbox
              id={`source-${source.id}`}
              checked={isSelected}
              onCheckedChange={onToggleSource}
            />
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={onToggleHidden}>
              {isHidden ? 'Show' : 'Hide'}
            </Button>
          </div>
          <CardTitle className="text-lg flex items-center gap-2">
            <label
              htmlFor={`source-${source.id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
              {source.name}
              {isHidden && (
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
          {Object.keys(availableFilters || {}).map(filterType => (
            <div key={filterType} className="mb-4">
              <div className="text-sm font-medium mb-1">{getFilterDisplayName(filterType)}:</div>
              <Select
                value={sourceFilter?.filter(f => f.startsWith(`${filterType}:`)).join(',')}
                onValueChange={value => handleFilterChange(filterType, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${getFilterDisplayName(filterType)}...`} />
                </SelectTrigger>
                <SelectContent>
                  {availableFilters?.[filterType]?.map((value: string) => (
                    <SelectItem key={`${filterType}:${value}`} value={`${filterType}:${value}`}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {sourceFilter?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {sourceFilter.map(filter => {
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
                      onClick={() => handleRemoveFilter(filter)}
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
                onClick={onClearSourceFilter}
              >
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);
SourceCard.displayName = 'SourceCard';

// Memoize the entire component to prevent unnecessary re-renders
export const DataSourceSelector = memo(
  ({
    dataSources,
    selectedSources,
    hiddenSources,
    onSelectionChange,
    availableFiltersBySource,
    sourceFilters,
    onFilterChange,
    onToggleHiddenSource,
    onClearSourceFilters,
  }: DataSourceSelectorProps) => {
    // Optimize toggle source handler
    const toggleSource = useCallback(
      (sourceId: string) => {
        if (selectedSources.includes(sourceId)) {
          onSelectionChange(selectedSources.filter(id => id !== sourceId));
        } else {
          onSelectionChange([...selectedSources, sourceId]);
        }
      },
      [selectedSources, onSelectionChange]
    );

    // Optimize source filter change handler
    const handleSourceFilterChange = useCallback(
      (sourceId: string, filters: string[]) => {
        onFilterChange(sourceId, filters);
      },
      [onFilterChange]
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataSources.map(source => (
          <SourceCard
            key={source.id}
            source={source}
            isSelected={selectedSources.includes(source.id)}
            isHidden={hiddenSources.includes(source.id)}
            availableFilters={availableFiltersBySource[source.id] || {}}
            sourceFilter={sourceFilters[source.id] || []}
            onToggleSource={() => toggleSource(source.id)}
            onToggleHidden={() => onToggleHiddenSource(source.id)}
            onFilterChange={filters => handleSourceFilterChange(source.id, filters)}
            onClearSourceFilter={() => onClearSourceFilters(source.id)}
          />
        ))}
      </div>
    );
  }
);
DataSourceSelector.displayName = 'DataSourceSelector';

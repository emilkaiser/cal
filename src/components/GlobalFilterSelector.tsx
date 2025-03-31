'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFilterDisplayName } from '@/utils/filter-utils';
import { Badge } from '@/components/ui/badge';
import { Filter, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function GlobalFilterSelector({
  availableFilters,
  selectedFilters,
  onFilterChange,
  onClearAll,
  activePreset,
  activePresetName,
}: {
  availableFilters: { [filterType: string]: Set<string> };
  selectedFilters: { [filterType: string]: string[] };
  onFilterChange: (filterType: string, values: string[]) => void;
  onClearAll: () => void;
  activePreset?: string | null;
  activePresetName?: string;
}) {
  const filterTypes = Object.keys(availableFilters).sort();
  // Find the first filter type with active filters to show initially
  const activeFilterType =
    filterTypes.find(type => (selectedFilters[type] || []).length > 0) || filterTypes[0];
  const [selectedFilterType, setSelectedFilterType] = useState<string>(activeFilterType || '');

  // Update selected filter type when active filters change
  useEffect(() => {
    // If there's a filter type with active filters and current selection has none, update selection
    const newActiveType = filterTypes.find(type => (selectedFilters[type] || []).length > 0);
    if (newActiveType && (selectedFilters[selectedFilterType] || []).length === 0) {
      setSelectedFilterType(newActiveType);
    }
  }, [selectedFilters, filterTypes, selectedFilterType]);

  // Toggle a filter value for a specific type
  const toggleFilter = (filterType: string, filterValue: string) => {
    const currentFilters = selectedFilters[filterType] || [];
    const newFilters = currentFilters.includes(filterValue)
      ? currentFilters.filter(f => f !== filterValue)
      : [...currentFilters, filterValue];

    onFilterChange(filterType, newFilters);
  };

  // Clear filters for a specific type
  const clearFilterType = (filterType: string) => {
    onFilterChange(filterType, []);
  };

  // Get total number of active filters
  const totalActiveFilters = Object.values(selectedFilters).flat().length;

  return (
    <div className="global-filter-selector p-4 bg-white dark:bg-gray-800 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Global Filters</h3>
          {activePreset && activePresetName && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Badge variant="outline" className="ml-2">
                      {activePresetName}
                      <Info className="ml-1 h-3 w-3" />
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filters from active preset</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {totalActiveFilters > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{totalActiveFilters} active</Badge>
            <Button variant="outline" size="sm" onClick={onClearAll}>
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Filter type selector tabs */}
      <div className="flex flex-wrap gap-1 mb-4 border-b">
        {filterTypes.map(filterType => {
          const isActive = selectedFilterType === filterType;
          const hasActiveFilters = (selectedFilters[filterType] || []).length > 0;

          return (
            <Button
              key={filterType}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-b-none border-b-0 ${hasActiveFilters ? 'font-bold' : ''}`}
              onClick={() => setSelectedFilterType(filterType)}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {selectedFilters[filterType].length}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      <ScrollArea className="h-[300px] pr-4">
        {selectedFilterType && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium capitalize">{selectedFilterType} Filters</h4>
              {selectedFilters[selectedFilterType]?.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearFilterType(selectedFilterType)}
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.from(availableFilters[selectedFilterType] || []).map(filter => {
                // Check if this filter is selected (checking both with and without prefix)
                const filterWithoutPrefix = filter.includes(':') ? filter.split(':')[1] : filter;
                const filterWithPrefix = filter.includes(':')
                  ? filter
                  : `${selectedFilterType}:${filter}`;

                const isSelected = (selectedFilters[selectedFilterType] || []).some(
                  f => f === filter || f === filterWithPrefix || f === filterWithoutPrefix
                );

                return (
                  <Button
                    key={filter}
                    onClick={() => toggleFilter(selectedFilterType, filter)}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="mb-1"
                  >
                    {getFilterDisplayName(filter)}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

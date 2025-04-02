'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFilterDisplayName } from '@/utils/filter-utils';
import { Badge } from '@/components/ui/badge';
import { Filter, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Memoize filter type tab for better performance
const FilterTypeTab = memo(
  ({
    filterType,
    isActive,
    filterCount,
    onClick,
  }: {
    filterType: string;
    isActive: boolean;
    filterCount: number;
    onClick: () => void;
  }) => {
    return (
      <Button
        variant={isActive ? 'default' : 'ghost'}
        size="sm"
        className={`rounded-b-none border-b-0 ${filterCount > 0 ? 'font-bold' : ''}`}
        onClick={onClick}
      >
        {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
        {filterCount > 0 && (
          <Badge variant="secondary" className="ml-2">
            {filterCount}
          </Badge>
        )}
      </Button>
    );
  }
);
FilterTypeTab.displayName = 'FilterTypeTab';

// Memoize filter value button for better performance
const FilterValueButton = memo(
  ({
    filter,
    isSelected,
    onClick,
  }: {
    filter: string;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    return (
      <Button
        onClick={onClick}
        variant={isSelected ? 'default' : 'outline'}
        size="sm"
        className="mb-1"
      >
        {getFilterDisplayName(filter)}
      </Button>
    );
  }
);
FilterValueButton.displayName = 'FilterValueButton';

// Export as memoized component
export const GlobalFilterSelector = memo(
  ({
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
  }) => {
    const filterTypes = Object.keys(availableFilters).sort();

    // Find the first filter type with active filters to show initially
    const getInitialFilterType = useCallback(() => {
      return filterTypes.find(type => (selectedFilters[type] || []).length > 0) || filterTypes[0];
    }, [filterTypes, selectedFilters]);

    const [selectedFilterType, setSelectedFilterType] = useState<string>(
      getInitialFilterType() || ''
    );

    // Update selected filter type when active filters change
    useEffect(() => {
      // If there's a filter type with active filters and current selection has none, update selection
      const newActiveType = filterTypes.find(type => (selectedFilters[type] || []).length > 0);
      if (newActiveType && (selectedFilters[selectedFilterType] || []).length === 0) {
        setSelectedFilterType(newActiveType);
      }

      // If the selected filter type no longer exists, pick a new one
      if (selectedFilterType && !filterTypes.includes(selectedFilterType)) {
        setSelectedFilterType(filterTypes[0] || '');
      }
    }, [selectedFilters, filterTypes, selectedFilterType]);

    // Toggle a filter value for a specific type - memoize to prevent recreation
    const toggleFilter = useCallback(
      (filterType: string, filterValue: string) => {
        const currentFilters = selectedFilters[filterType] || [];
        const newFilters = currentFilters.includes(filterValue)
          ? currentFilters.filter(f => f !== filterValue)
          : [...currentFilters, filterValue];

        onFilterChange(filterType, newFilters);
      },
      [selectedFilters, onFilterChange]
    );

    // Clear filters for a specific type - memoize to prevent recreation
    const clearFilterType = useCallback(
      (filterType: string) => {
        onFilterChange(filterType, []);
      },
      [onFilterChange]
    );

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
          {filterTypes.map(filterType => (
            <FilterTypeTab
              key={filterType}
              filterType={filterType}
              isActive={selectedFilterType === filterType}
              filterCount={(selectedFilters[filterType] || []).length}
              onClick={() => setSelectedFilterType(filterType)}
            />
          ))}
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
                    <FilterValueButton
                      key={filter}
                      filter={filter}
                      isSelected={isSelected}
                      onClick={() => toggleFilter(selectedFilterType, filter)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    );
  }
);
GlobalFilterSelector.displayName = 'GlobalFilterSelector';

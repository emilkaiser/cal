'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataSource } from '@/lib/dataSources';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';

interface DataSourceSelectorProps {
  dataSources: DataSource[];
  selectedSources: string[];
  onSelectionChange: (selectedSources: string[]) => void;
  availableFiltersBySource: {
    [sourceId: string]: { [filterType: string]: string[] };
  };
  sourceFilters: { [sourceId: string]: string[] };
  onFilterChange: (sourceId: string, filters: string[]) => void;
}

export function DataSourceSelector({
  dataSources,
  selectedSources,
  onSelectionChange,
  availableFiltersBySource,
  sourceFilters,
  onFilterChange,
}: DataSourceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedFilterTypes, setSelectedFilterTypes] = useState<{ [sourceId: string]: string }>(
    {}
  );

  const toggleSource = (sourceId: string) => {
    const isSelected = selectedSources.includes(sourceId);

    if (isSelected) {
      onSelectionChange(selectedSources.filter(id => id !== sourceId));
    } else {
      onSelectionChange([...selectedSources, sourceId]);
    }
  };

  const selectAll = () => {
    onSelectionChange(dataSources.map(source => source.id));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const handleFilterChange = (sourceId: string, values: string[]) => {
    onFilterChange(sourceId, values);
  };

  const clearFilters = (sourceId: string) => {
    onFilterChange(sourceId, []);
  };

  const selectAllFilters = (sourceId: string, filterType: string) => {
    if (!availableFiltersBySource[sourceId] || !availableFiltersBySource[sourceId][filterType]) {
      return;
    }

    // Add all filters for the selected type to the current filters
    const existingFilters = sourceFilters[sourceId] || [];
    const allFiltersForType = availableFiltersBySource[sourceId][filterType];

    // Combine existing filters with the filters for this type
    const updatedFilters = [...new Set([...existingFilters, ...allFiltersForType])];

    onFilterChange(sourceId, updatedFilters);
  };

  const getFilterDisplayName = (filter: string): string => {
    const [type, value] = filter.split(':');
    return value || filter;
  };

  const getFiltersByTypeForSource = (sourceId: string) => {
    if (!availableFiltersBySource[sourceId]) return [];
    return Object.keys(availableFiltersBySource[sourceId]).sort();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between w-full md:w-[300px]"
            >
              Select data sources
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full md:w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search data sources..." />
              <CommandEmpty>No data source found.</CommandEmpty>

              <div className="flex items-center justify-between p-2 border-b">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
              </div>

              <CommandGroup>
                {dataSources.map(source => (
                  <CommandItem
                    key={source.id}
                    value={source.id}
                    onSelect={() => toggleSource(source.id)}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={selectedSources.includes(source.id)}
                      onCheckedChange={() => toggleSource(source.id)}
                      id={`checkbox-${source.id}`}
                    />
                    <div
                      className="h-3 w-3 rounded-full mr-1"
                      style={{ backgroundColor: source.color }}
                    />
                    <span>{source.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex flex-wrap gap-1">
          {selectedSources.length > 0 && (
            <div className="flex flex-wrap gap-1 max-w-[500px]">
              {selectedSources.map(sourceId => {
                const source = dataSources.find(s => s.id === sourceId);
                if (!source) return null;

                return (
                  <Badge
                    key={sourceId}
                    variant="outline"
                    className="flex items-center gap-1"
                    style={{
                      borderColor: source.color,
                      backgroundColor: `${source.color}20`,
                    }}
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: source.color }}
                    />
                    {source.name}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedSources.length > 0 && (
        <Accordion type="multiple" className="w-full">
          {selectedSources.map(sourceId => {
            const source = dataSources.find(s => s.id === sourceId);
            if (!source) return null;

            const filterTypes = getFiltersByTypeForSource(sourceId);
            const filters = sourceFilters[sourceId] || [];
            const selectedType =
              selectedFilterTypes[sourceId] || (filterTypes.length > 0 ? filterTypes[0] : null);

            return (
              <AccordionItem key={sourceId} value={sourceId}>
                <AccordionTrigger className="hover:no-underline group">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: source.color }}
                    />
                    <span>{source.name} Filters</span>

                    {filters.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {filters.length} active
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-4">
                    {filterTypes.length > 0 ? (
                      <>
                        {/* Filter type selector */}
                        <div className="mb-4">
                          <div className="text-sm font-medium mb-2">Filter Type:</div>
                          <ToggleGroup
                            type="single"
                            value={selectedType ?? ''}
                            onValueChange={value => {
                              if (value) {
                                setSelectedFilterTypes({
                                  ...selectedFilterTypes,
                                  [sourceId]: value,
                                });
                              }
                            }}
                            className="flex flex-wrap gap-2"
                          >
                            {filterTypes.map(filterType => (
                              <ToggleGroupItem
                                key={filterType}
                                value={filterType}
                                variant="outline"
                                className="capitalize border border-input px-3 py-1.5 rounded-md transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                              >
                                {filterType}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </div>

                        <div className="flex justify-between mb-2">
                          {selectedType && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => selectAllFilters(sourceId, selectedType)}
                            >
                              Select All {selectedType}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => clearFilters(sourceId)}
                          >
                            Clear All Filters
                          </Button>
                        </div>

                        <Separator className="my-2" />

                        {selectedType &&
                        availableFiltersBySource[sourceId] &&
                        availableFiltersBySource[sourceId][selectedType] ? (
                          <ScrollArea className="h-[200px] pr-4">
                            <ToggleGroup
                              type="multiple"
                              variant="outline"
                              value={filters}
                              onValueChange={values => handleFilterChange(sourceId, values)}
                              className="flex flex-wrap gap-2"
                            >
                              {availableFiltersBySource[sourceId][selectedType].map(filter => (
                                <ToggleGroupItem
                                  key={filter}
                                  value={filter}
                                  variant="outline"
                                  className="border border-input px-3 py-1.5 rounded-md transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                >
                                  {getFilterDisplayName(filter)}
                                </ToggleGroupItem>
                              ))}
                            </ToggleGroup>
                          </ScrollArea>
                        ) : (
                          <div className="text-sm text-muted-foreground py-4 text-center">
                            No filters available for this source
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground py-4 text-center">
                        No filters available for this source
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}

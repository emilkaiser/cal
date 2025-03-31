import { useState, useEffect, useCallback } from 'react';
import { DataSource } from '@/lib/data-sources';
import { CalendarEvent as BaseCalendarEvent } from '@/types/types';
import { FilterPreset, filterPresetsObject } from '@/config/filterPresets';
import { eventMatchesFilters } from '@/utils/filter-utils';

// Define CalendarEvent with source property
interface CalendarEvent extends BaseCalendarEvent {
  source?: string;
}

export type SourceFilters = {
  [sourceId: string]: string[];
};

export type FilterState = {
  globalFilters: { [filterType: string]: string[] };
  sourceFilters: SourceFilters;
  selectedSources: string[];
  hiddenSources: string[];
  activePreset: string | null;
};

export function useCalendarFilters(events: CalendarEvent[], dataSources: DataSource[]) {
  // Main filter state
  const [globalFilters, setGlobalFilters] = useState<{ [filterType: string]: string[] }>({});
  const [sourceFilters, setSourceFilters] = useState<SourceFilters>({});
  const [selectedSources, setSelectedSources] = useState<string[]>(
    dataSources.map(source => source.id)
  );
  const [hiddenSources, setHiddenSources] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Track filtered events
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>(events);

  // Track all available filters by source
  const [availableFiltersBySource, setAvailableFiltersBySource] = useState<{
    [sourceId: string]: { [filterType: string]: string[] };
  }>({});

  // Track all available global filters
  const [availableGlobalFilters, setAvailableGlobalFilters] = useState<{
    [filterType: string]: Set<string>;
  }>({});

  // Track active filters for display
  const [activeFilters, setActiveFilters] = useState<
    { label: string; type: string; value: string }[]
  >([]);

  // Extract unique filter types and values from events
  useEffect(() => {
    const filtersBySource: { [sourceId: string]: { [filterType: string]: Set<string> } } = {};
    const globalFilterSet: { [filterType: string]: Set<string> } = {};

    events.forEach(event => {
      if (!event.filterTags) return;

      // Process each filter tag
      event.filterTags.forEach(tag => {
        if (!tag.includes(':')) return;

        const [type, value] = tag.split(':');

        // Add to global filters
        if (!globalFilterSet[type]) {
          globalFilterSet[type] = new Set<string>();
        }
        globalFilterSet[type].add(value);

        // Add to source-specific filters
        if (event.source) {
          if (!filtersBySource[event.source]) {
            filtersBySource[event.source] = {};
          }

          if (!filtersBySource[event.source][type]) {
            filtersBySource[event.source][type] = new Set<string>();
          }

          filtersBySource[event.source][type].add(value);
        }
      });
    });

    // Convert Sets to sorted arrays for sources
    const result: { [sourceId: string]: { [filterType: string]: string[] } } = {};
    Object.entries(filtersBySource).forEach(([sourceId, filterTypes]) => {
      result[sourceId] = {};
      Object.entries(filterTypes).forEach(([filterType, valuesSet]) => {
        result[sourceId][filterType] = Array.from(valuesSet).sort();
      });
    });

    setAvailableFiltersBySource(result);
    setAvailableGlobalFilters(globalFilterSet);

    // Initialize empty filters for each source
    const initialFilters: SourceFilters = {};
    Object.keys(result).forEach(sourceId => {
      initialFilters[sourceId] = [];
    });

    setSourceFilters(prevFilters => {
      return Object.keys(prevFilters).length > 0 ? prevFilters : initialFilters;
    });
  }, [events]);

  // Filter events based on active filters
  useEffect(() => {
    const filtered = events.filter(event => {
      if (event.source && hiddenSources.includes(event.source)) return false;
      if (event.source && !selectedSources.includes(event.source)) return false;
      return eventMatchesFilters(event, sourceFilters, globalFilters);
    });

    setFilteredEvents(filtered);
  }, [events, sourceFilters, globalFilters, selectedSources, hiddenSources]);

  // Update active filters for display
  useEffect(() => {
    const active: { label: string; type: string; value: string }[] = [];

    // Add global filters
    Object.entries(globalFilters).forEach(([type, values]) => {
      values.forEach(value => {
        const displayValue = value.includes(':') ? value.split(':')[1] : value;
        active.push({
          label: `${type}: ${displayValue}`,
          type,
          value,
        });
      });
    });

    // Add source filters
    Object.entries(sourceFilters).forEach(([sourceId, filters]) => {
      if (filters.length > 0) {
        const source = dataSources.find(s => s.id === sourceId);
        filters.forEach(filter => {
          const [type, displayValue] = filter.includes(':') ? filter.split(':') : ['', filter];
          active.push({
            label: `${source?.name || sourceId}: ${type} - ${displayValue}`,
            type: `source-${sourceId}-${type}`,
            value: filter,
          });
        });
      }
    });

    setActiveFilters(active);

    // Check if we need to deactivate the preset
    if (activePreset) {
      const preset = filterPresetsObject[activePreset];
      if (preset) {
        const globalFiltersMatch = Object.entries(preset.globalFilters).every(
          ([type, presetValues]) => {
            const currentValues = globalFilters[type] || [];
            return presetValues.every(
              val => currentValues.includes(`${type}:${val}`) || currentValues.includes(val)
            );
          }
        );

        const sourceFiltersMatch = Object.entries(preset.sourceFilters).every(
          ([sourceId, presetValues]) => {
            const currentValues = sourceFilters[sourceId] || [];
            return presetValues.every(
              val =>
                currentValues.includes(val) || currentValues.some(current => current.endsWith(val))
            );
          }
        );

        const sourcesMatch =
          preset.selectedSources.every(source => selectedSources.includes(source)) &&
          preset.hiddenSources.every(source => hiddenSources.includes(source));

        if (!globalFiltersMatch || !sourceFiltersMatch || !sourcesMatch) {
          setActivePreset(null);
        }
      }
    }
  }, [globalFilters, sourceFilters, selectedSources, hiddenSources, dataSources, activePreset]);

  // Handler for global filter changes
  const handleGlobalFilterChange = useCallback((filterType: string, values: string[]) => {
    setGlobalFilters(prev => {
      // Normalize values to ensure they have the filterType: prefix
      const normalizedValues = values.map(value =>
        value.includes(':') ? value : `${filterType}:${value}`
      );

      return {
        ...prev,
        [filterType]: normalizedValues,
      };
    });
  }, []);

  // Handler for clearing global filters
  const clearGlobalFilters = useCallback(() => {
    setGlobalFilters({});
  }, []);

  // Handler for source filter changes
  const handleSourceFilterChange = useCallback((sourceId: string, filters: string[]) => {
    setSourceFilters(prev => ({
      ...prev,
      [sourceId]: filters,
    }));
  }, []);

  // Handler for setting selected sources
  const handleSelectedSourcesChange = useCallback((sources: string[]) => {
    setSelectedSources(sources);
  }, []);

  // Handler for clearing source filters
  const clearSourceFilter = useCallback((sourceId: string) => {
    setSourceFilters(prev => ({
      ...prev,
      [sourceId]: [],
    }));
  }, []);

  // Handler for removing a specific filter
  const removeFilter = useCallback(
    (type: string, value: string) => {
      if (type.startsWith('source-')) {
        const [_, sourceId, filterType] = type.split('-');
        const currentFilters = sourceFilters[sourceId] || [];
        const newFilters = currentFilters.filter(f => f !== value);
        handleSourceFilterChange(sourceId, newFilters);
      } else {
        const currentFilters = globalFilters[type] || [];
        const newFilters = currentFilters.filter(f => f !== value);
        handleGlobalFilterChange(type, newFilters);
      }
    },
    [sourceFilters, globalFilters, handleSourceFilterChange, handleGlobalFilterChange]
  );

  // Reset all filters
  const clearAllFilters = useCallback(() => {
    clearGlobalFilters();

    const emptySourceFilters: SourceFilters = {};
    Object.keys(sourceFilters).forEach(sourceId => {
      emptySourceFilters[sourceId] = [];
    });

    setSourceFilters(emptySourceFilters);
    setSelectedSources(dataSources.map(source => source.id));
    setHiddenSources([]);
    setActivePreset(null);
  }, [clearGlobalFilters, sourceFilters, dataSources]);

  // Apply a preset
  const applyPreset = useCallback(
    (preset: FilterPreset) => {
      // Clear existing filters
      clearAllFilters();

      // Apply source filters
      const newSourceFilters: SourceFilters = { ...sourceFilters };
      for (const sourceId in preset.sourceFilters) {
        newSourceFilters[sourceId] = preset.sourceFilters[sourceId].map(filter => {
          return filter.includes(':') ? filter : `team:${filter}`;
        });
      }
      setSourceFilters(newSourceFilters);

      // Apply global filters - ensure they have proper prefixes
      for (const filterType in preset.globalFilters) {
        const normalizedFilters = preset.globalFilters[filterType].map(filter => {
          return filter.includes(':') ? filter : `${filterType}:${filter}`;
        });
        handleGlobalFilterChange(filterType, normalizedFilters);
      }

      // Apply source selection
      if (preset.selectedSources && preset.selectedSources.length > 0) {
        setSelectedSources(preset.selectedSources);
      } else {
        setSelectedSources(dataSources.map(source => source.id));
      }

      // Apply hidden sources
      setHiddenSources(preset.hiddenSources || []);

      // Set active preset
      setActivePreset(preset.id);
    },
    [clearAllFilters, sourceFilters, handleGlobalFilterChange, dataSources]
  );

  // Toggle preset (activate/deactivate)
  const togglePreset = useCallback(
    (preset: FilterPreset) => {
      if (activePreset === preset.id) {
        clearAllFilters();
      } else {
        applyPreset(preset);
      }
    },
    [activePreset, clearAllFilters, applyPreset]
  );

  // Toggle hidden source
  const toggleHiddenSource = useCallback((sourceId: string) => {
    setHiddenSources(prev =>
      prev.includes(sourceId) ? prev.filter(id => id !== sourceId) : [...prev, sourceId]
    );
  }, []);

  return {
    // Filter state
    globalFilters,
    sourceFilters,
    selectedSources,
    hiddenSources,
    activePreset,

    // Filtered results
    filteredEvents,

    // Available filters
    availableFiltersBySource,
    availableGlobalFilters,
    activeFilters,

    // Actions
    setSelectedSources: handleSelectedSourcesChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onSourceFilterChange: handleSourceFilterChange,
    onClearGlobalFilters: clearGlobalFilters,
    onClearSourceFilter: clearSourceFilter,
    onRemoveFilter: removeFilter,
    onClearAllFilters: clearAllFilters,
    onApplyPreset: applyPreset,
    onTogglePreset: togglePreset,
    onToggleHiddenSource: toggleHiddenSource,
  };
}

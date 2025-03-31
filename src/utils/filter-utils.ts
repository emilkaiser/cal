import type { CalendarEvent as BaseCalendarEvent } from '../types/types';
import { getPropertyFromFilterTags, hasFilterTag } from './calendar-utils';

// Extend the CalendarEvent type to include the source property
interface CalendarEvent extends BaseCalendarEvent {
  source?: string;
}

type SourceFilters = {
  [sourceId: string]: string[];
};

/**
 * Checks if an event matches the given filters
 */
export function eventMatchesFilters(
  event: CalendarEvent,
  sourceFilters: SourceFilters,
  globalFilters: { [filterType: string]: string[] }
): boolean {
  // Check source-specific filters first
  if (event.source && sourceFilters[event.source]?.length > 0) {
    // The event must match at least one filter for each filter type
    const matchesAllSourceFilters = sourceFilters[event.source].every(filter => {
      // Only check filters that have a type and value
      if (!filter.includes(':')) return true;

      const [type, value] = filter.split(':');

      // Check if the event has this filter tag
      return hasFilterTag(event.filterTags, type, value);
    });

    if (!matchesAllSourceFilters) return false;
  }

  // Check global filters
  for (const filterType in globalFilters) {
    if (globalFilters[filterType].length === 0) continue;

    // The event must match at least one value for this filter type
    const matchesAnyValue = globalFilters[filterType].some(filter => {
      // Handle both formats (with or without prefix)
      if (filter.includes(':')) {
        const [type, value] = filter.split(':');
        return hasFilterTag(event.filterTags, type, value);
      } else {
        // Legacy format (should be phased out)
        return hasFilterTag(event.filterTags, filterType, filter);
      }
    });

    if (!matchesAnyValue) return false;
  }

  return true;
}

/**
 * Gets a human-readable display name for a filter
 */
export function getFilterDisplayName(filterType: string): string {
  const displayNames: Record<string, string> = {
    activity: 'Activity',
    team: 'Team',
    venue: 'Venue',
    match: 'Match Type',
    opponent: 'Opponent',
    gender: 'Gender',
    ageGroup: 'Age Group',
    color: 'Color',
    category: 'Category',
    location: 'Location',
  };

  return displayNames[filterType] || filterType.charAt(0).toUpperCase() + filterType.slice(1);
}

/**
 * Extracts all possible filter values from events
 */
export function extractAvailableFilters(events: CalendarEvent[]) {
  const globalFilterSet: { [filterType: string]: Set<string> } = {};

  events.forEach(event => {
    if (!event.filterTags) return;

    event.filterTags.forEach(tag => {
      if (!tag.includes(':')) return;

      const [type, value] = tag.split(':');

      if (!globalFilterSet[type]) {
        globalFilterSet[type] = new Set<string>();
      }

      globalFilterSet[type].add(value);
    });
  });

  return globalFilterSet;
}

/**
 * Extracts all unique filter tags from a list of events
 */
export function extractUniqueFilterTags(events: CalendarEvent[]) {
  const filterSet: { [filterType: string]: Set<string> } = {};

  events.forEach(event => {
    if (!event.filterTags) return;

    event.filterTags.forEach(tag => {
      if (!tag.includes(':')) return;

      const [type, value] = tag.split(':');

      if (!filterSet[type]) {
        filterSet[type] = new Set<string>();
      }

      filterSet[type].add(value);
    });
  });

  return filterSet;
}

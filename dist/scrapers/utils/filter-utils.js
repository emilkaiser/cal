"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterCache = void 0;
exports.buildFilterTags = buildFilterTags;
exports.extractFilterData = extractFilterData;
exports.getFilterDisplayName = getFilterDisplayName;
exports.eventMatchesFilters = eventMatchesFilters;
// Create a singleton cache
exports.filterCache = {
    byEvent: new WeakMap(),
};
// Function to build filter tags for a calendar event
function buildFilterTags(event) {
    const tags = [];
    // Add team filter - prefer formattedTeam over team if available
    if (event.formattedTeam) {
        tags.push(`team:${event.formattedTeam}`);
    }
    else if (event.team) {
        tags.push(`team:${event.team}`);
    }
    // Add activity filter if available (like Match, Training, etc.)
    if (event.activity) {
        tags.push(`activity:${event.activity}`);
        // Also add as category for backward compatibility with tests
        tags.push(`category:${event.activity}`);
    }
    // Add category tags from categories array if activity is missing
    if (!event.activity && event.categories && Array.isArray(event.categories)) {
        event.categories.forEach(category => {
            tags.push(`category:${category}`);
        });
    }
    // Add venue filters if available
    if (event.venues && Array.isArray(event.venues)) {
        event.venues.forEach(venue => {
            // Use location: prefix for consistency with tests
            tags.push(`location:${venue}`);
        });
    }
    // Add color filter if available and not "unknown"
    if (event.color && event.color.toLowerCase() !== 'unknown') {
        tags.push(`color:${event.color}`);
    }
    // Add age group filter if available
    if (event.ageGroup) {
        tags.push(`ageGroup:${event.ageGroup}`);
    }
    // Add gender filter if available
    if (event.gender) {
        tags.push(`gender:${event.gender}`);
    }
    // Add match type filter if available (Home/Away/External)
    if (event.match) {
        tags.push(`match:${event.match}`);
    }
    return tags;
}
// Function to extract filter data from events - will use cache if available
function extractFilterData(events) {
    // Check cache first
    if (exports.filterCache.byEvent.has(events)) {
        return exports.filterCache.byEvent.get(events);
    }
    console.time('Filter data extraction');
    const filtersBySource = {};
    const globalFilterSet = {};
    events.forEach(event => {
        if (!event.filterTags)
            return;
        event.filterTags.forEach(tag => {
            if (!tag.includes(':'))
                return;
            const [type, value] = tag.split(':');
            // Add to global filters
            if (!globalFilterSet[type]) {
                globalFilterSet[type] = new Set();
            }
            globalFilterSet[type].add(value);
            // Add to source-specific filters if event has a source
            if ('source' in event && event.source) {
                if (!filtersBySource[event.source]) {
                    filtersBySource[event.source] = {};
                }
                if (!filtersBySource[event.source][type]) {
                    filtersBySource[event.source][type] = new Set();
                }
                filtersBySource[event.source][type].add(value);
            }
        });
    });
    // Convert Set to arrays for the source filters
    const result = {
        filtersBySource: Object.fromEntries(Object.entries(filtersBySource).map(([sourceId, filterTypes]) => [
            sourceId,
            Object.fromEntries(Object.entries(filterTypes).map(([filterType, valuesSet]) => [
                filterType,
                Array.from(valuesSet).sort(),
            ])),
        ])),
        globalFilters: globalFilterSet,
    };
    // Store in cache
    exports.filterCache.byEvent.set(events, result);
    console.timeEnd('Filter data extraction');
    return result;
}
// Get a display-friendly name for a filter type
function getFilterDisplayName(filter) {
    if (filter.includes(':')) {
        const [type, value] = filter.split(':');
        return value;
    }
    // Capitalize first letter and replace dashes and underscores with spaces
    return filter
        .replace(/([A-Z])/g, ' $1') // Insert a space before capital letters
        .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
        .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
}
// Check if an event matches the current filters
function eventMatchesFilters(event, sourceFilters, globalFilters) {
    // Check if event has required filterTags
    if (!event.filterTags) {
        return Object.keys(globalFilters).length === 0; // Only show if no global filters
    }
    // Process source-specific filters if event has a source
    if ('source' in event && event.source) {
        const sourceId = event.source;
        const sourceFilterValues = sourceFilters[sourceId] || [];
        // If we have source filters but none match, hide the event
        if (sourceFilterValues.length > 0) {
            const hasMatch = sourceFilterValues.some(filterValue => {
                // Handle full filter strings (with type:value format)
                if (filterValue.includes(':')) {
                    return event.filterTags.includes(filterValue);
                }
                // Fallback to check if any filter tag ends with the value (legacy support)
                return event.filterTags.some(tag => tag.endsWith(filterValue));
            });
            if (!hasMatch)
                return false;
        }
    }
    // Process global filters
    for (const [filterType, filterValues] of Object.entries(globalFilters)) {
        if (filterValues.length === 0)
            continue; // Skip empty filter types
        // Check if event has any matching filters for this type
        const matchesType = filterValues.some(value => {
            // Handle both formats: with and without type prefix
            const fullFilterValue = value.includes(':') ? value : `${filterType}:${value}`;
            return event.filterTags.includes(fullFilterValue);
        });
        if (!matchesType)
            return false;
    }
    return true;
}

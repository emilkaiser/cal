"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCalendarEvents = normalizeCalendarEvents;
exports.getPropertyFromFilterTags = getPropertyFromFilterTags;
exports.hasFilterTag = hasFilterTag;
/**
 * Ensures all calendar events have properly formatted filterTags
 * based on their properties.
 */
function normalizeCalendarEvents(events) {
    return events.map(event => {
        const filterTags = [...(event.filterTags || [])];
        // Add activity tag if it exists and isn't already in filterTags
        if (event.activity && !filterTags.some(tag => tag.startsWith('activity:'))) {
            filterTags.push(`activity:${event.activity}`);
        }
        // Add match tag if it exists and isn't already in filterTags
        if (event.match && !filterTags.some(tag => tag.startsWith('match:'))) {
            filterTags.push(`match:${event.match}`);
        }
        // Add team tag if it exists and isn't already in filterTags
        if (event.team && !filterTags.some(tag => tag.startsWith('team:'))) {
            filterTags.push(`team:${event.team}`);
        }
        // Add gender tag if it exists and isn't already in filterTags
        if (event.gender && !filterTags.some(tag => tag.startsWith('gender:'))) {
            filterTags.push(`gender:${event.gender}`);
        }
        // Add ageGroup tag if it exists and isn't already in filterTags
        if (event.ageGroup && !filterTags.some(tag => tag.startsWith('ageGroup:'))) {
            filterTags.push(`ageGroup:${event.ageGroup}`);
        }
        // Add color tag if it exists and isn't already in filterTags
        if (event.color && !filterTags.some(tag => tag.startsWith('color:'))) {
            filterTags.push(`color:${event.color}`);
        }
        // Add venue tags
        if (event.venues && event.venues.length > 0) {
            event.venues.forEach(venue => {
                if (!filterTags.some(tag => tag === `venue:${venue}`)) {
                    filterTags.push(`venue:${venue}`);
                }
            });
        }
        // Add location tag for backward compatibility
        if (event.location && !filterTags.some(tag => tag.startsWith('location:'))) {
            filterTags.push(`location:${event.location}`);
        }
        // Add opponent tag if it exists
        if (event.opponent && !filterTags.some(tag => tag.startsWith('opponent:'))) {
            filterTags.push(`opponent:${event.opponent}`);
        }
        // Add category tags
        if (event.categories && event.categories.length > 0) {
            event.categories.forEach(category => {
                if (!filterTags.some(tag => tag === `category:${category}`)) {
                    filterTags.push(`category:${category}`);
                }
            });
        }
        // Return updated event with normalized filterTags
        return Object.assign(Object.assign({}, event), { filterTags });
    });
}
/**
 * Extracts a specific property from a filterTag
 */
function getPropertyFromFilterTags(filterTags, property) {
    if (!filterTags)
        return undefined;
    const tag = filterTags.find(tag => tag.startsWith(`${property}:`));
    if (!tag)
        return undefined;
    return tag.split(':')[1];
}
/**
 * Check if a filter value exists in filterTags
 */
function hasFilterTag(filterTags, property, value) {
    if (!filterTags)
        return false;
    return filterTags.some(tag => tag === `${property}:${value}`);
}

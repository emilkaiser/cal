"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFilterTags = buildFilterTags;
/**
 * Generate filter tags based on event properties
 * @param event Calendar event
 * @returns Array of filter tags
 */
function buildFilterTags(event) {
    const filterTags = [];
    // Team tag - use formattedTeam if available, otherwise fall back to team
    if (event.formattedTeam) {
        filterTags.push(`team:${event.formattedTeam}`);
    }
    else if (event.team) {
        filterTags.push(`team:${event.team}`);
    }
    // Match type tag
    if (event.match) {
        filterTags.push(`match:${event.match}`);
    }
    // Location tags
    if (event.venues && event.venues.length > 0) {
        event.venues.forEach(venue => filterTags.push(`location:${venue}`));
    }
    // Activity/Category tag
    if (event.activity) {
        filterTags.push(`category:${event.activity}`);
    }
    else if (event.categories && event.categories.length > 0) {
        // Use the first category if activity is not available
        filterTags.push(`category:${event.categories[0]}`);
    }
    // Gender tag
    if (event.gender) {
        filterTags.push(`gender:${event.gender}`);
    }
    // Age group tag
    if (event.ageGroup) {
        filterTags.push(`ageGroup:${event.ageGroup}`);
    }
    // Color tag
    if (event.color && event.color !== 'unknown') {
        filterTags.push(`color:${event.color}`);
    }
    return filterTags;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomeAwayCategory = exports.EVENT_TYPES = void 0;
exports.getEventType = getEventType;
exports.extractAgeGroup = extractAgeGroup;
const match_utils_1 = require("./match-utils");
// Common event types in calendars
exports.EVENT_TYPES = {
    MATCH: 'Match',
    TRAINING: 'Träning',
    CUP: 'Cup',
    TOURNAMENT: 'Turnering',
    MEETING: 'Möte',
    EVENT: 'Event',
    OTHER: 'Övrigt',
};
// Use the version from match-utils.ts instead
exports.getHomeAwayCategory = match_utils_1.getHomeAwayCategory;
function getEventType(event) {
    if (!event.title) {
        return undefined;
    }
    // First check if the event already has a category that matches an event type
    if (event.categories && event.categories.length > 0) {
        for (const category of event.categories) {
            const eventType = Object.values(exports.EVENT_TYPES).find(type => category.toLowerCase() === type.toLowerCase());
            if (eventType) {
                return eventType;
            }
        }
    }
    // Check if the title starts with any of the known event types
    const title = event.title.trim();
    for (const [_, prefix] of Object.entries(exports.EVENT_TYPES)) {
        if (title.toLowerCase().startsWith(`${prefix.toLowerCase()} - `) ||
            title.toLowerCase().startsWith(`${prefix.toLowerCase()}: `)) {
            return prefix;
        }
    }
    // Look for specific patterns in the title
    if (title.toLowerCase().includes(' vs ') ||
        title.toLowerCase().includes(' mot ') ||
        /\s+-\s+/.test(title)) {
        return exports.EVENT_TYPES.MATCH;
    }
    if (title.toLowerCase().includes('träning') || title.toLowerCase().includes('training')) {
        return exports.EVENT_TYPES.TRAINING;
    }
    if (title.toLowerCase().includes('cup')) {
        return exports.EVENT_TYPES.CUP;
    }
    if (title.toLowerCase().includes('turnering')) {
        return exports.EVENT_TYPES.TOURNAMENT;
    }
    if (title.toLowerCase().includes('möte') || title.toLowerCase().includes('mote')) {
        return exports.EVENT_TYPES.MEETING;
    }
    return undefined;
}
/**
 * Extract age group from a string (e.g., title, category)
 * Handles formats like "P2012", "F2011-", "P12", etc.
 * Returns only the year part without P/F prefix
 */
function extractAgeGroup(text) {
    if (!text)
        return undefined;
    // First check for full 4-digit years (highest priority)
    const yearMatch = text.match(/\b(20\d{2})\b/);
    if (yearMatch) {
        return yearMatch[1];
    }
    // Match Swedish football age group patterns:
    // P2012, F2010, P12, F09, P2012-, P2012- 3K, etc.
    const patterns = [
        // Pattern for "P2012-", "P2012- 3K", etc.
        /\b([PF])(\d{4})(-|\s*-\s*)/i,
        // Pattern for "P2012", "F2010", etc.
        /\b([PF])(\d{4})\b/i,
        // Pattern for "P12", "F09", etc.
        /\b([PF])(\d{2})\b/i,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const [_, gender, year] = match;
            // Return only the year part
            if (year.length === 4) {
                return year;
            }
            else if (year.length === 2) {
                // For two-digit years, assume 20xx
                return `20${year}`;
            }
        }
    }
    return undefined;
}

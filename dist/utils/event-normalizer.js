"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeEvent = normalizeEvent;
const categorize_events_1 = require("./categorize-events");
const location_utils_1 = require("./location-utils");
function normalizeEvent(event) {
    var _a;
    // Start with basic event data
    const normalizedEvent = {
        uid: event.uid || `event-${Math.random().toString(36).substring(2)}`,
        title: event.title,
        start: event.start,
        end: event.end,
        description: event.description,
        location: event.location,
        url: event.url,
        categories: event.categories || [],
        sourceType: event.sourceType,
    };
    // Determine event type if not already set
    if (!normalizedEvent.activity) {
        normalizedEvent.activity = (0, categorize_events_1.getEventType)(normalizedEvent);
    }
    if (!normalizedEvent.ageGroup) {
        normalizedEvent.ageGroup = (0, categorize_events_1.extractAgeGroup)(normalizedEvent.title);
    }
    if (!normalizedEvent.venues && normalizedEvent.location) {
        normalizedEvent.venues = (0, location_utils_1.extractVenues)(normalizedEvent.location);
        normalizedEvent.categories = (_a = normalizedEvent.categories) !== null && _a !== void 0 ? _a : [];
        for (const venue of normalizedEvent.venues) {
            if (!normalizedEvent.categories.includes(venue)) {
                normalizedEvent.categories.push(venue);
            }
        }
    }
    // Determine home/away status if not already set
    if (!normalizedEvent.match && normalizedEvent.activity === 'Match') {
        const homeAway = (0, categorize_events_1.getHomeAwayCategory)(normalizedEvent);
        if (homeAway) {
            normalizedEvent.match = homeAway.toLowerCase();
            // Add to categories if not already there
            normalizedEvent.categories = normalizedEvent.categories || [];
            if (!normalizedEvent.categories.includes(homeAway)) {
                normalizedEvent.categories.push(homeAway);
            }
        }
    }
    return normalizedEvent;
}

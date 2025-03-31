"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeEvent = normalizeEvent;
const event_categorizer_1 = require("./event-categorizer");
const venue_utils_1 = require("./venue-utils");
const match_utils_1 = require("./match-utils");
const team_parser_1 = require("./team-parser");
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
        // Preserve rawData from source event
        rawData: event.rawData,
    };
    // Copy additional properties if provided in the source event
    if (event.formattedTeam)
        normalizedEvent.formattedTeam = event.formattedTeam;
    if (event.gender)
        normalizedEvent.gender = event.gender;
    if (event.ageGroup)
        normalizedEvent.ageGroup = event.ageGroup;
    if (event.team)
        normalizedEvent.team = event.team;
    if (event.match)
        normalizedEvent.match = event.match;
    if (event.activity)
        normalizedEvent.activity = event.activity;
    // Determine event type if not already set
    if (!normalizedEvent.activity) {
        normalizedEvent.activity = (0, event_categorizer_1.getEventType)(normalizedEvent);
    }
    // Extract team info if available
    if (normalizedEvent.title && !normalizedEvent.team) {
        const { rawTeam } = (0, team_parser_1.extractTeamInfo)(normalizedEvent.title);
        if (rawTeam) {
            normalizedEvent.team = rawTeam;
        }
    }
    if (!normalizedEvent.ageGroup) {
        normalizedEvent.ageGroup = (0, event_categorizer_1.extractAgeGroup)(normalizedEvent.title);
    }
    if (!normalizedEvent.venues && normalizedEvent.location) {
        normalizedEvent.venues = (0, venue_utils_1.extractVenues)(normalizedEvent.location);
        normalizedEvent.categories = (_a = normalizedEvent.categories) !== null && _a !== void 0 ? _a : [];
        for (const venue of normalizedEvent.venues) {
            if (!normalizedEvent.categories.includes(venue)) {
                normalizedEvent.categories.push(venue);
            }
        }
    }
    // Determine home/away status if not already set
    if (!normalizedEvent.match && normalizedEvent.activity === 'Match') {
        const homeAway = (0, match_utils_1.getHomeAwayCategory)(normalizedEvent);
        if (homeAway) {
            normalizedEvent.match = homeAway;
            // Add to categories if not already there
            normalizedEvent.categories = normalizedEvent.categories || [];
            if (!normalizedEvent.categories.includes(homeAway)) {
                normalizedEvent.categories.push(homeAway);
            }
        }
    }
    return normalizedEvent;
}

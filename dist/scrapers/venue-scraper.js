"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBookings = fetchBookings;
exports.transformToSourceData = transformToSourceData;
exports.enhanceSourceEvents = enhanceSourceEvents;
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const calendar_io_1 = require("./utils/calendar-io");
const venue_utils_1 = require("./utils/venue-utils");
const event_categorizer_1 = require("./utils/event-categorizer");
const event_formatter_1 = require("./utils/event-formatter");
const match_utils_1 = require("./utils/match-utils");
const team_metadata_1 = require("./utils/team-metadata");
const team_parser_1 = require("./utils/team-parser");
// Define resource IDs for the venues we want to fetch
const RESOURCE_IDS = [15452, 15469]; // Aspuddens IP and Västberga IP
const BASE_URL = 'https://www.stff.se/api/venue/getmatches/?facilityMatchesId=';
// 1. Fetch data from external source
function fetchBookings() {
    return __awaiter(this, void 0, void 0, function* () {
        const allMatches = [];
        for (const resourceId of RESOURCE_IDS) {
            const url = `${BASE_URL}${resourceId}`;
            console.log(`Fetching matches from ${url}`);
            try {
                const response = yield fetch(url);
                if (!response.ok) {
                    console.error(`Failed to fetch from ${url}: ${response.status} ${response.statusText}`);
                    continue; // Skip this resource but continue with others
                }
                const data = yield response.json();
                console.log(`Found ${data.matches.length} matches from venue API (resource ID: ${resourceId})`);
                // Add matches from this resource to our collection
                allMatches.push(...data.matches);
            }
            catch (error) {
                console.error(`Error fetching from resource ID ${resourceId}:`, error);
                // Continue with other resources even if one fails
            }
        }
        console.log(`Total matches fetched: ${allMatches.length}`);
        return allMatches;
    });
}
// 2. Transform into source-specific format
function transformToSourceData(matches) {
    console.log('Transforming matches to source data events');
    return matches.map(match => {
        // Parse the ISO date string from the API
        const startDate = new Date(match.date.iso8601);
        // Create an end date 1.5 hours after start time
        const endDate = new Date(startDate.getTime() + 90 * 60000); // 90 minutes
        const title = `${match.home.team} vs ${match.away.team}`;
        const description = `${match.category}${match.note ? ` - ${match.note}` : ''}`;
        return {
            uid: `venue-match-${match.id}`,
            start: startDate,
            end: endDate,
            title,
            description,
            location: match.location,
            url: `https://www.stff.se${match.url}`,
            categories: [match.category],
            sourceType: 'venue',
            rawData: match,
        };
    });
}
// Source-specific enhancement
function enhanceSourceEvents(events) {
    console.log('Applying venue-specific enhancements to events');
    return events.map(event => {
        // Make a copy to avoid modifying the original
        const enhancedEvent = Object.assign({}, event);
        if (event.rawData) {
            const match = event.rawData;
            // Extract gender information
            if (match.genderName) {
                enhancedEvent.gender =
                    match.genderName === 'Man'
                        ? 'Pojkar'
                        : match.genderName === 'Kvinna'
                            ? 'Flickor'
                            : undefined;
            }
            // Extract age group from category - only the year part
            if (match.category) {
                enhancedEvent.ageGroup = (0, event_categorizer_1.extractAgeGroup)(match.category);
            }
            // Extract venues from location
            if (match.location) {
                enhancedEvent.venues = (0, venue_utils_1.extractVenues)(match.location);
            }
            // Determine match status based on team names
            const matchStatus = (0, match_utils_1.determineMatchStatus)(match.home.team, match.away.team);
            enhancedEvent.match = matchStatus === 'External' ? 'External' : matchStatus;
            // Extract raw team name - only if it's an Aspudden team
            const rawTeam = (0, match_utils_1.extractTeamFromMatch)(match.home.team, match.away.team);
            if (rawTeam) {
                // Store rawTeam for consistency with laget-scraper
                enhancedEvent.rawTeam = rawTeam;
                // The team property is the same as rawTeam in venue-scraper
                enhancedEvent.team = rawTeam;
                // Extract team color if we have a team
                enhancedEvent.color = (0, team_metadata_1.getColorFromTeamName)(rawTeam);
                // Create formatted team name using the utility
                if (enhancedEvent.gender && enhancedEvent.ageGroup) {
                    enhancedEvent.formattedTeam = (0, team_parser_1.createFormattedTeamName)(enhancedEvent.gender, enhancedEvent.ageGroup, enhancedEvent.color);
                }
                // If we couldn't create a formatted team name, use the raw team
                if (!enhancedEvent.formattedTeam) {
                    enhancedEvent.formattedTeam = rawTeam;
                }
            }
            // Extract opponent
            enhancedEvent.opponent = (0, match_utils_1.extractOpponentFromMatch)(match.home.team, match.away.team, matchStatus);
            // Always set activity to "Match" for venue events
            enhancedEvent.activity = 'Match';
            // Add formatted title - use formattedTeam instead of team
            enhancedEvent.formattedTitle = (0, event_formatter_1.formatEventTitle)(enhancedEvent.formattedTeam || '', enhancedEvent.title, enhancedEvent.activity, enhancedEvent.match, enhancedEvent.opponent, match.home.team, match.away.team);
        }
        return enhancedEvent;
    });
}
// 3. Enhance events with utilities
function enhanceEvents(events) {
    console.log('Enhancing events with categories and metadata');
    return events.map(event => {
        const enhancedEvent = Object.assign({}, event);
        // Remove temporary rawTeam property after it's been used
        delete enhancedEvent.rawTeam;
        return enhancedEvent;
    });
}
// Filter helpers
function filterIP1Events(events) {
    return events.filter(event => event.location && (0, venue_utils_1.isAspuddensIP1)(event.location));
}
function filterIP2Events(events) {
    return events.filter(event => event.location && (0, venue_utils_1.isAspuddensIP2)(event.location));
}
function filterVastbergaEvents(events) {
    return events.filter(event => event.location && (0, venue_utils_1.isVastbergaIP)(event.location));
}
// 4. Main process
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Step 1: Create venue data directory
            const dataDir = path.join('data', 'venue');
            yield fs.mkdir(dataDir, { recursive: true });
            // Step 2: Fetch raw data from external sources and merge
            const matches = yield fetchBookings();
            // Step 3: Transform raw data into source events
            const sourceEvents = transformToSourceData(matches);
            // Step 4: Apply venue-specific enhancements to events
            const enhancedSourceEvents = enhanceSourceEvents(sourceEvents);
            // Step 5: Apply general enhancements
            const finalEvents = enhanceEvents(enhancedSourceEvents);
            // Step 6: Save all events
            yield (0, calendar_io_1.saveEventsToJson)(finalEvents, path.join(dataDir, 'all.json'));
            console.log(`Saved ${finalEvents.length} total events to data/venue/all.json`);
            // Step 7: Filter and save IP1 events
            const ip1Events = filterIP1Events(finalEvents);
            yield (0, calendar_io_1.saveEventsToJson)(ip1Events, path.join(dataDir, 'aspuddens-ip-1.json'));
            console.log(`Saved ${ip1Events.length} IP1 events to data/venue/aspuddens-ip-1.json`);
            // Step 8: Filter and save IP2 events
            const ip2Events = filterIP2Events(finalEvents);
            yield (0, calendar_io_1.saveEventsToJson)(ip2Events, path.join(dataDir, 'aspuddens-ip-2.json'));
            console.log(`Saved ${ip2Events.length} IP2 events to data/venue/aspuddens-ip-2.json`);
            // Step 9: Filter and save Västberga events
            const vastbergaEvents = filterVastbergaEvents(finalEvents);
            yield (0, calendar_io_1.saveEventsToJson)(vastbergaEvents, path.join(dataDir, 'vastberga-ip.json'));
            console.log(`Saved ${vastbergaEvents.length} Västberga IP events to data/venue/vastberga-ip.json`);
        }
        catch (error) {
            console.error('Error processing venue data:', error);
        }
    });
}
if (require.main === module) {
    main().catch(console.error);
}

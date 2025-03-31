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
exports.fetchTeamSlugs = fetchTeamSlugs;
exports.fetchIcsCalendar = fetchIcsCalendar;
exports.transformLagetEvents = transformLagetEvents;
exports.enhanceLagetEvents = enhanceLagetEvents;
const jsdom_1 = require("jsdom");
const ical = __importStar(require("node-ical"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const calendar_io_1 = require("../utils/calendar-io");
const team_metadata_1 = require("../utils/team-metadata");
const venue_utils_1 = require("../utils/venue-utils");
const activity_utils_1 = require("../utils/activity-utils");
const match_utils_1 = require("../utils/match-utils");
const event_formatter_1 = require("../utils/event-formatter");
const team_parser_1 = require("../utils/team-parser");
const filter_utils_1 = require("../utils/filter-utils");
function fetchTeamSlugs() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Fetching team slugs from IFK Aspudden-Tellus website...');
        const url = 'https://www.ifkaspudden-tellus.se/';
        const response = yield fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
        }
        const html = yield response.text();
        const dom = new jsdom_1.JSDOM(html);
        const document = dom.window.document;
        // Target the correct team items from the popover structure
        const teamListItems = document.querySelectorAll('.teamsPopover__listItemOuter');
        console.log(`Found ${teamListItems.length} team list items`);
        const teams = [];
        teamListItems.forEach(item => {
            var _a;
            const linkElement = item.querySelector('.teamsPopover__listItemInner');
            const nameElement = item.querySelector('.popoverList__teamName');
            if (linkElement && nameElement) {
                const name = ((_a = nameElement.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                const href = linkElement.getAttribute('href') || '';
                if (href && name) {
                    // Extract the slug from the laget.se URL
                    const slug = href.replace('https://www.laget.se/', '');
                    if (slug) {
                        teams.push({
                            name,
                            slug,
                        });
                    }
                }
            }
        });
        console.log(`Found ${teams.length} teams`);
        teams.forEach(team => console.log(`- ${team.name} (${team.slug})`));
        return teams;
    });
}
function generateIcsUrl(slug) {
    return `https://cal.laget.se/${slug}.ics`;
}
function fetchIcsCalendar(url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Fetching calendar from ${url}`);
        try {
            const response = yield fetch(url);
            if (!response.ok) {
                console.warn(`Failed to fetch calendar: ${response.status} ${response.statusText}`);
                return {};
            }
            const icsContent = yield response.text();
            return yield ical.parseICS(icsContent);
        }
        catch (error) {
            console.error(`Error fetching or parsing calendar from ${url}:`, error);
            return {};
        }
    });
}
function transformLagetEvents(events) {
    const sourceEvents = [];
    for (const eventId in events) {
        // Skip non-VEVENT entries (like VTIMEZONE)
        const event = events[eventId];
        if (event.type !== 'VEVENT') {
            continue;
        }
        const sourceEvent = {
            uid: event.uid,
            title: event.summary || 'Unnamed event',
            start: event.start,
            end: event.end,
            description: event.description,
            location: event.location,
            categories: Array.isArray(event.categories)
                ? event.categories
                : event.categories
                    ? [event.categories]
                    : undefined,
            sourceType: 'laget',
            rawData: event,
        };
        sourceEvents.push(sourceEvent);
    }
    return sourceEvents;
}
function enhanceLagetEvents(events) {
    return events.map(event => {
        const activity = (0, activity_utils_1.getActivityTypeFromCategories)(event.categories);
        const match = (0, match_utils_1.getHomeAwayCategory)(event);
        const opponent = (0, match_utils_1.getOpponent)(event);
        const venues = (0, venue_utils_1.extractVenues)(event.location);
        // Extract team info using the utility
        const { rawTeam } = (0, team_parser_1.extractTeamInfo)(event.title || '');
        return Object.assign(Object.assign({}, event), { activity,
            venues,
            match,
            opponent,
            rawTeam });
    });
}
function getTeamMeta(teamName) {
    const color = (0, team_metadata_1.getColorFromTeamName)(teamName);
    const gender = (0, team_metadata_1.getGenderFromTeamName)(teamName);
    const ageGroup = (0, team_metadata_1.getAgeGroupFromTeamName)(teamName);
    // Use utility to create formatted team name
    const formattedTeam = (0, team_parser_1.createFormattedTeamName)(gender, ageGroup, color) || teamName;
    return {
        formattedTeam,
        color,
        gender,
        ageGroup,
    };
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create output directory if it doesn't exist
            const dataDir = path.join('data', 'laget');
            yield fs.mkdir(dataDir, { recursive: true });
            // Step 1: Fetch team slugs
            const teams = yield fetchTeamSlugs();
            const allEvents = [];
            // Process each team
            for (const team of teams) {
                // Step 1: Fetch calendar data
                const icsUrl = generateIcsUrl(team.slug);
                const calendar = yield fetchIcsCalendar(icsUrl);
                // Step 2: Get team metadata
                const meta = getTeamMeta(team.name);
                // Step 3: Transform events
                const sourceEvents = transformLagetEvents(calendar);
                console.log(`Found ${sourceEvents.length} events for team ${team.name}`);
                // Step 4: Enhance each event
                const enhancedSourceEvents = enhanceLagetEvents(sourceEvents);
                // Step 5: Add to collection with metadata and filter tags
                allEvents.push(...enhancedSourceEvents.map(e => {
                    // Use the raw team name from the event if available, otherwise use the team name
                    const teamName = e.rawTeam || team.name;
                    const eventWithMeta = Object.assign(Object.assign(Object.assign({}, e), meta), { 
                        // Use raw team name if available, otherwise use the team name from metadata
                        team: teamName, url: icsUrl, 
                        // Format the title with appropriate icons
                        formattedTitle: (0, event_formatter_1.formatEventTitle)(meta.formattedTeam, e.title, e.activity, e.match, e.opponent) });
                    // Add filter tags to each event
                    const eventWithTags = Object.assign(Object.assign({}, eventWithMeta), { filterTags: (0, filter_utils_1.buildFilterTags)(eventWithMeta) });
                    // Remove the temporary rawTeam property
                    delete eventWithTags.rawTeam;
                    return eventWithTags;
                }));
            }
            // Step 6: Save all events
            if (allEvents.length > 0) {
                const jsonFilePath = path.join(dataDir, 'calendar.json');
                yield (0, calendar_io_1.saveEventsToJson)(allEvents, jsonFilePath);
                console.log(`Laget data saved to ${jsonFilePath} with ${allEvents.length} total events`);
            }
            else {
                console.log('No events found, no data file was created.');
            }
        }
        catch (error) {
            console.error('Error processing laget data:', error);
        }
    });
}
if (require.main === module) {
    main().catch(console.error);
}

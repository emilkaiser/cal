"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_TYPES = void 0;
exports.getHomeAwayCategory = getHomeAwayCategory;
exports.getEventType = getEventType;
exports.extractAgeGroup = extractAgeGroup;
const location_utils_1 = require("./location-utils");
// Load team names from configuration
const TEAM_NAMES = ['IFK Aspudden-Tellus', 'IFK AT', 'Aspudden', 'Tellus'];
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
function getHomeAwayCategory(event) {
    var _a, _b;
    // Skip if not a sport event or already categorized
    if (!event.title || ((_a = event.categories) === null || _a === void 0 ? void 0 : _a.includes('home')) || ((_b = event.categories) === null || _b === void 0 ? void 0 : _b.includes('away'))) {
        return undefined;
    }
    const teamNames = TEAM_NAMES.map(name => name.toLowerCase());
    // Look for "vs" pattern or team name followed by dash
    const vsPattern = /(.+?)\s+(?:vs|VS|mot)\s+(.+?)$/;
    const dashPattern = /(.+?)\s+-\s+(.+?)$/;
    let homeTeam = '';
    let awayTeam = '';
    // Try to extract teams from the title
    const vsMatch = event.title.match(vsPattern);
    const dashMatch = !vsMatch && event.title.match(dashPattern);
    if (vsMatch) {
        // Format is "Team1 vs Team2"
        homeTeam = vsMatch[1].trim();
        awayTeam = vsMatch[2].trim();
    }
    else if (dashMatch) {
        // Format is "Team1 - Team2"
        homeTeam = dashMatch[1].trim();
        awayTeam = dashMatch[2].trim();
    }
    if (homeTeam && awayTeam) {
        // Check if our team is the home team
        const isHome = teamNames.some(name => homeTeam.toLowerCase().includes(name));
        // Check if our team is the away team
        const isAway = teamNames.some(name => awayTeam.toLowerCase().includes(name));
        if (isHome && !isAway) {
            return 'home';
        }
        else if (isAway && !isHome) {
            return 'away';
        }
    }
    // If location contains our venue, it's likely a home game
    if (event.location && (0, location_utils_1.isHomeVenue)(event.location)) {
        return 'home';
    }
    else if (event.location && event.location.trim() !== '') {
        // If there's a location and it's not our home field, assume it's away
        return 'away';
    }
    return undefined;
}
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
function extractTeamInfo(title) {
    // Extract age group and team color if present (like "P2011 Gul")
    const teamNameMatch = title.match(/\b([PF]\d{2,4}(?:\s+(?:Gul|Röd|Blå|Grön|Svart|Vit|Gröna|Blåa|Röda|Gula|Svarta|Vita|[A-Z]))?)\b/i);
    let baseTeamName = teamNameMatch ? teamNameMatch[1] : '';
    // Check if it's a match (contains "vs", "mot", "Match")
    const vsMatch = title.match(/(.+?)(?:\s+(?:vs|VS|mot|Match)\s+)(.+)/i);
    if (vsMatch) {
        // If the match has a specific team name from earlier, use it, otherwise use the match group
        const homeTeam = baseTeamName || vsMatch[1].trim();
        return {
            homeTeam: homeTeam,
            awayTeam: vsMatch[2].trim(),
            isMatch: true,
            baseTeamName: homeTeam,
        };
    }
    // Check if team name is before a dash (common format in Swedish events)
    const dashMatch = title.match(/^(.+?)\s*-\s*(.+)$/);
    if (dashMatch) {
        // If we already found a specific team name (like P2011 Gul), use it
        const homeTeam = baseTeamName || dashMatch[1].trim();
        return {
            homeTeam: homeTeam,
            isMatch: dashMatch[2].toLowerCase().includes('match'),
            baseTeamName: homeTeam,
        };
    }
    // If we found a team name like P2011 Gul earlier, use it
    if (baseTeamName) {
        return {
            homeTeam: baseTeamName,
            isMatch: title.toLowerCase().includes('match'),
            baseTeamName: baseTeamName,
        };
    }
    // Just return the full title as the team name as a fallback
    return {
        homeTeam: title,
        isMatch: false,
        baseTeamName: title,
    };
}
/**
 * Extract age group from a string (e.g., title, category)
 * Handles formats like "P2012", "F2011-", "P12", etc.
 * Returns only the year part without P/F prefix
 */
function extractAgeGroup(text) {
    if (!text)
        return undefined;
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
    // Match just numbers for more generic cases
    const yearMatch = text.match(/\b(20\d{2})\b/);
    if (yearMatch) {
        return yearMatch[1];
    }
    return undefined;
}
function extractGender(title) {
    const lowerTitle = title.toLowerCase();
    // Check for explicit gender indicators
    if (/\b(herr|herrar|pojk|p\d{2}|p20\d{2})\b/.test(lowerTitle)) {
        return 'Pojkar';
    }
    if (/\b(dam|damer|flick|f\d{2}|f20\d{2})\b/.test(lowerTitle)) {
        return 'Flickor';
    }
    // Look for P or F followed by numbers which indicates age group by gender
    // Check for P followed by 2-4 digits at the beginning of a word
    if (/\bP(?:\d{2}|\d{4})\b/i.test(title)) {
        return 'Pojkar';
    }
    // Check for F followed by 2-4 digits at the beginning of a word
    if (/\bF(?:\d{2}|\d{4})\b/i.test(title)) {
        return 'Flickor';
    }
    return 'unknown';
}
function extractTeamName(title) {
    // First check for "TEAM vs OPPONENT" pattern
    const vsMatch = title.match(/^(.*?)\s+(?:vs|VS|mot)\s+/);
    if (vsMatch && vsMatch[1]) {
        return vsMatch[1].trim();
    }
    // Then check for common patterns like "TEAM - EVENT"
    const dashMatch = title.match(/^(.*?)(?:\s*[-:]\s*)/);
    if (dashMatch && dashMatch[1]) {
        return dashMatch[1].trim();
    }
    return undefined;
}

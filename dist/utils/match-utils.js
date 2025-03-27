"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomeAwayCategory = getHomeAwayCategory;
exports.getOpponent = getOpponent;
const location_utils_1 = require("./location-utils");
const TEAM_NAMES = ['IFK Aspudden-Tellus', 'IFK AT', 'AT', 'Aspudden', 'Tellus'];
/**
 * Extract team names from event title
 * @param title Event title to parse
 * @returns Object containing home and away teams, or null if parsing failed
 */
function extractTeamsFromTitle(title) {
    if (!title) {
        return null;
    }
    // Look for "vs" pattern or team name followed by dash
    const vsPattern = /(.+?)\s+(?:vs|VS|mot)\s+(.+?)$/;
    const dashPattern = /(.+?)\s+-\s+(.+?)$/;
    // Try to extract teams from the title using vs pattern first
    const vsMatch = title.match(vsPattern);
    if (vsMatch) {
        // Format is "Team1 vs Team2"
        return {
            homeTeam: vsMatch[1].trim(),
            awayTeam: vsMatch[2].trim(),
        };
    }
    // Clean up title by removing "Match" prefix only if it is at the start
    let cleanTitle = title;
    if (cleanTitle.startsWith('Match ')) {
        cleanTitle = cleanTitle.substring(6).trim();
    }
    // Try dash pattern with cleaned title
    const dashMatch = cleanTitle.match(dashPattern);
    if (dashMatch) {
        // Format is "Team1 - Team2"
        return {
            homeTeam: dashMatch[1].trim(),
            awayTeam: dashMatch[2].trim(),
        };
    }
    // Fallback: If no patterns match, return null
    return null;
}
/**
 * Escape special characters in a string for use in a regular expression
 * @param str String to escape
 * @returns Escaped string
 */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * Check if a team name matches one of our team names
 * @param teamName Team name to check
 * @returns true if it matches one of our teams
 */
function isOurTeam(teamName) {
    const teamNameLower = teamName.toLowerCase();
    // Use word-boundary regex for each team name
    for (const team of TEAM_NAMES) {
        const regex = new RegExp('\\b' + escapeRegExp(team.toLowerCase()) + '\\b', 'i');
        if (regex.test(teamNameLower)) {
            return true;
        }
    }
    // Handle special cases like "AT F2014 Gul"
    for (const segment of teamNameLower.split(' ')) {
        if ((segment === 'at' || segment === 'if') && teamNameLower.includes('f20')) {
            return true;
        }
    }
    return false;
}
function getHomeAwayCategory(event) {
    var _a, _b;
    // Skip if not a sport event or already categorized
    if (!event.title || ((_a = event.categories) === null || _a === void 0 ? void 0 : _a.includes('Home')) || ((_b = event.categories) === null || _b === void 0 ? void 0 : _b.includes('Away'))) {
        return undefined;
    }
    const teams = extractTeamsFromTitle(event.title);
    if (teams) {
        const isHome = isOurTeam(teams.homeTeam);
        const isAway = isOurTeam(teams.awayTeam);
        if (isHome && !isAway) {
            return 'Home';
        }
        else if (isAway && !isHome) {
            return 'Away';
        }
    }
    // If location contains our venue, it's likely a home game
    if (event.location && (0, location_utils_1.isHomeVenue)(event.location)) {
        return 'Home';
    }
    else if (event.location && event.location.trim() !== '') {
        // Only assume away if we couldn't determine it's a home venue
        return 'Away';
    }
    return undefined;
}
/**
 * Extract the opponent team name from an event title
 * @param event Calendar event
 * @returns The name of the opponent team or undefined if it can't be determined
 */
function getOpponent(event) {
    if (!event.title) {
        return undefined;
    }
    if (event.activity === 'Träning') {
        return undefined;
    }
    // Use original title for extraction - don't remove "Match" prefix here
    // This ensures that when "Match" is part of a team name, it's preserved
    const teams = extractTeamsFromTitle(event.title);
    if (!teams) {
        return undefined;
    }
    // Check if our team is the home team
    const isOurTeamHome = isOurTeam(teams.homeTeam);
    // Check if our team is the away team
    const isOurTeamAway = isOurTeam(teams.awayTeam);
    // If it's our team vs our team (internal match), return undefined
    if (isOurTeamHome && isOurTeamAway) {
        return undefined;
    }
    // Return the opponent team name
    if (isOurTeamHome) {
        return teams.awayTeam;
    }
    else if (isOurTeamAway) {
        return teams.homeTeam;
    }
    return undefined;
}

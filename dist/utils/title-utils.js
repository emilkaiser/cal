"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatEventTitle = formatEventTitle;
/**
 * Formats event title with appropriate icons based on event type
 */
function formatEventTitle(team, originalTitle, activity, match, opponent) {
    // Handle training events
    if (activity === 'Träning') {
        return `⚽ ${team}`;
    }
    // Don't show match formatting for "Övrigt" activities
    if (activity === 'Övrigt') {
        if (originalTitle && !originalTitle.includes(team)) {
            return `${team} (${originalTitle})`;
        }
        return team;
    }
    // Handle match events
    if (match) {
        // Clean up opponent name if it exists
        let cleanOpponent = opponent;
        if (cleanOpponent && cleanOpponent.startsWith('Match ')) {
            cleanOpponent = cleanOpponent.substring(6).trim();
        }
        if (match === 'Home') {
            return cleanOpponent ? `🆚🏠 ${team} (vs ${cleanOpponent})` : `🆚🏠 ${team}`;
        }
        else if (match === 'Away') {
            return cleanOpponent ? `🆚🚍 ${team} (vs ${cleanOpponent})` : `🆚🚍 ${team}`;
        }
        else {
            // Generic match with no home/away distinction
            return cleanOpponent ? `🆚 ${team} (vs ${cleanOpponent})` : `🆚 ${team}`;
        }
    }
    // Default: Use team name and original title if it adds information
    if (originalTitle && !originalTitle.includes(team)) {
        return `${team} (${originalTitle})`;
    }
    return team;
}

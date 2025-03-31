"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatEventTitle = formatEventTitle;
/**
 * Formats event title with appropriate icons based on event type
 */
function formatEventTitle(formattedTeam, originalTitle = '', // Add default value to avoid undefined
activity, match, opponent, homeTeam, awayTeam) {
    // Handle empty formattedTeam edge case
    if (!formattedTeam && originalTitle) {
        return ` (${originalTitle})`;
    }
    if (!formattedTeam && !originalTitle) {
        return '';
    }
    // Handle training events
    if (activity === 'Träning') {
        return `⚽ ${formattedTeam}`;
    }
    // Don't show match formatting for "Övrigt" activities
    if (activity === 'Övrigt') {
        if (originalTitle && !originalTitle.includes(formattedTeam)) {
            return `${formattedTeam} (${originalTitle})`;
        }
        return formattedTeam;
    }
    // Handle match events
    // Use type guard to check for specific cases first
    if (match) {
        // Clean up opponent name if it exists
        let cleanOpponent = opponent;
        if (cleanOpponent && cleanOpponent.startsWith('Match ')) {
            cleanOpponent = cleanOpponent.substring(6);
        }
        if (cleanOpponent) {
            cleanOpponent = cleanOpponent.trim();
        }
        // Handle special cases for empty string or unknown (cast as Match by the test)
        // Using type assertion for empty string since TypeScript doesn't allow direct comparison
        if (match === '' || match === 'unknown') {
            return cleanOpponent ? `🆚 ${formattedTeam} (vs ${cleanOpponent})` : `🆚 ${formattedTeam}`;
        }
        // Handle standard match types
        if (match === 'Home') {
            return cleanOpponent
                ? `🆚🏠 ${formattedTeam} (vs ${cleanOpponent})`
                : `🆚🏠 ${formattedTeam}`;
        }
        else if (match === 'Away') {
            return cleanOpponent
                ? `🆚🚍 ${formattedTeam} (vs ${cleanOpponent})`
                : `🆚🚍 ${formattedTeam}`;
        }
        else if (match === 'External') {
            // For external matches, show both teams if available
            if (homeTeam && awayTeam) {
                return `🆚 External (${homeTeam} vs ${awayTeam})`;
            }
            // Fallback to original title if team names aren't available
            return `🆚 External (${originalTitle})`;
        }
        else {
            // Generic match with no home/away distinction
            return cleanOpponent ? `🆚 ${formattedTeam} (vs ${cleanOpponent})` : `🆚 ${formattedTeam}`;
        }
    }
    // Default: Use team name and original title if it adds information
    if (originalTitle && !originalTitle.includes(formattedTeam)) {
        return `${formattedTeam} (${originalTitle})`;
    }
    return formattedTeam;
}

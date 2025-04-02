"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatEventTitle = formatEventTitle;
const types_1 = require("../../types/types");
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
    if (activity === types_1.TRAINING) {
        return `⚽ ${formattedTeam}`;
    }
    // Don't show match formatting for "Övrigt" activities
    if (activity === types_1.OTHER) {
        if (originalTitle && !originalTitle.includes(formattedTeam)) {
            return `${formattedTeam} (${originalTitle})`;
        }
        return formattedTeam;
    }
    // Clean up opponent name if it exists
    let cleanOpponent = opponent;
    if (cleanOpponent && cleanOpponent.startsWith('Match ')) {
        cleanOpponent = cleanOpponent.substring(6);
    }
    if (cleanOpponent) {
        cleanOpponent = cleanOpponent.trim();
    }
    // Handle match events
    if (match !== undefined && match !== null) {
        // Handle special cases for empty string
        if (match === '') {
            return cleanOpponent ? `⚽ ${formattedTeam} (vs ${cleanOpponent})` : `⚽ ${formattedTeam}`;
        }
        // Handle standard match types
        if (match === types_1.MATCH_HOME) {
            return cleanOpponent ? `🏟️ ${formattedTeam} (vs ${cleanOpponent})` : `🏟️ ${formattedTeam}`;
        }
        else if (match === types_1.MATCH_AWAY) {
            return cleanOpponent ? `✈️ ${formattedTeam} (vs ${cleanOpponent})` : `✈️ ${formattedTeam}`;
        }
        else if (match === types_1.MATCH_EXTERNAL) {
            // For external matches, show both teams if available
            if (homeTeam && awayTeam) {
                return `🏟️ External (${homeTeam} vs ${awayTeam})`;
            }
            // Fallback to original title if team names aren't available
            return `🏟️ External (${originalTitle})`;
        }
        else {
            // Generic match with no home/away distinction
            return cleanOpponent ? `⚽ ${formattedTeam} (vs ${cleanOpponent})` : `⚽ ${formattedTeam}`;
        }
    }
    // When opponent is provided, treat as a generic match even if match type is undefined
    if (cleanOpponent) {
        return `⚽ ${formattedTeam} (vs ${cleanOpponent})`;
    }
    // cup
    if (activity === types_1.CUP) {
        return `🏆 ${formattedTeam} (${originalTitle})`;
    }
    // Default: Use team name and original title if it adds information
    if (originalTitle && !originalTitle.includes(formattedTeam)) {
        return `${formattedTeam} (${originalTitle})`;
    }
    return formattedTeam;
}

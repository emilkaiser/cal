"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorFromTeamName = getColorFromTeamName;
exports.getGenderFromTeamName = getGenderFromTeamName;
exports.getAgeGroupFromTeamName = getAgeGroupFromTeamName;
exports.getHexColor = getHexColor;
/**
 * Extracts the team color from the team name
 * @param teamName Team name like "P2014 Blå" or "F2016 Röd"
 * @returns The color as a lowercase string or "unknown"
 */
function getColorFromTeamName(teamName) {
    var _a;
    const parts = teamName.split(' ');
    // Only return the last part if there's more than one part (i.e., there's a color)
    if (parts.length > 1) {
        const lastPart = ((_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        // Check if the last part is likely a color
        if (['blå', 'röd', 'vit', 'svart', 'gul'].includes(lastPart)) {
            return capitalizeFirstLetter(lastPart);
        }
    }
    return 'unknown';
}
function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
/**
 * Determines the gender from the team name
 * @param teamName Team name like "P2014 Blå" or "F2016 Röd"
 * @returns "Flickor", "Pojkar", or "unknown"
 */
function getGenderFromTeamName(teamName) {
    if (teamName.match(/F\d{4}/))
        return 'Flickor';
    if (teamName.match(/P\d{4}/))
        return 'Pojkar';
    return 'unknown';
}
/**
 * Extracts the age group from the team name
 * @param teamName Team name like "P2014 Blå" or "F2016 Röd"
 * @returns The year as a string or "unknown"
 */
function getAgeGroupFromTeamName(teamName) {
    const match = teamName.match(/(P|F)(\d{4})/);
    return match ? match[2] : 'unknown';
}
/**
 * Maps color names to hex color codes
 * @param color Color name as a lowercase string
 * @returns Hex color code
 */
function getHexColor(color) {
    switch (color) {
        case 'Blå':
            return '#007bff';
        case 'Röd':
            return '#dc3545';
        case 'Vit':
            return '#ffffff';
        case 'Svart':
            return '#000000';
        case 'Gul':
            return '#ffc107';
        default:
            return '#000000';
    }
}

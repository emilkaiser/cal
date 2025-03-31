"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorFromTeamName = getColorFromTeamName;
exports.getGenderFromTeamName = getGenderFromTeamName;
exports.getAgeGroupFromTeamName = getAgeGroupFromTeamName;
exports.getHexColor = getHexColor;
/**
 * Extracts the team color from the team name
 * @param teamName Team name like "P2014 Blå", "F2016 Röd", or "IFK Aspudden-Tellus Gul 3"
 * @returns The color as a capitalized string or "unknown"
 */
function getColorFromTeamName(teamName) {
    if (!teamName)
        return 'unknown';
    // Define the Swedish colors we're looking for
    const colors = ['blå', 'röd', 'vit', 'svart', 'gul', 'grön'];
    // Direct match for "P2014 Blå" pattern
    const ageColorPattern = /[PF]\d{4}\s+([A-Za-zÀ-ÖØ-öø-ÿ]+)/i;
    const directMatch = teamName.match(ageColorPattern);
    if (directMatch && directMatch[1]) {
        const colorPart = directMatch[1].toLowerCase();
        const normalizedColor = colorPart.endsWith('a') ? colorPart.slice(0, -1) : colorPart;
        if (colors.includes(normalizedColor)) {
            return capitalizeFirstLetter(normalizedColor);
        }
    }
    // Try to match any color in the team name as a standalone word
    for (const color of colors) {
        const regex = new RegExp(`\\b${color}\\b`, 'i');
        if (regex.test(teamName.toLowerCase())) {
            return capitalizeFirstLetter(color);
        }
        // Also check for plural forms (common in Swedish)
        const pluralColor = `${color}a`;
        const pluralRegex = new RegExp(`\\b${pluralColor}\\b`, 'i');
        if (pluralRegex.test(teamName.toLowerCase())) {
            return capitalizeFirstLetter(color);
        }
    }
    // If no direct match, look for words ending with numbers that might indicate a team color group
    // Example: "IFK Aspudden-Tellus Gul 3"
    const parts = teamName.split(' ');
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].toLowerCase();
        if (colors.includes(part) && i < parts.length - 1 && /^\d+$/.test(parts[i + 1])) {
            return capitalizeFirstLetter(part);
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
            return '#000000'; // Changed from 'grey' to '#000000' to match test
        case 'Gul':
            return '#ffc107';
        case 'Grön':
            return '#28a745';
        default:
            return '#000000'; // Default to black for unknown colors
    }
}

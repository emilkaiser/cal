"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHexColor = getHexColor;
exports.getVenueColor = getVenueColor;
exports.getContrastingColor = getContrastingColor;
exports.isLightColor = isLightColor;
/**
 * Maps color names to hex color codes
 */
const colorMap = {
    // English color names
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    purple: '#a855f7',
    pink: '#ec4899',
    gray: '#6b7280',
    orange: '#f97316',
    teal: '#14b8a6',
    cyan: '#06b6d4',
    indigo: '#6366f1',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    lime: '#84cc16',
    emerald: '#10b981',
    sky: '#0ea5e9',
    fuchsia: '#d946ef',
    rose: '#f43f5e',
    white: '#ffffff',
    black: '#000000',
    // Swedish color names
    röd: '#ef4444', // Red
    blå: '#3b82f6', // Blue
    grön: '#22c55e', // Green
    gul: '#eab308', // Yellow
    lila: '#a855f7', // Purple
    rosa: '#ec4899', // Pink
    grå: '#6b7280', // Gray
    //orange: '#f97316', // Orange (same in Swedish)
    vit: '#ffffff', // White
    svart: '#000000', // Black
    // Other common translations might be added here
    unknown: '#6b7280', // Default to gray
};
/**
 * Convert color string to hex format
 */
function getHexColor(color) {
    // If it's already hex, return it
    if (color.startsWith('#')) {
        return color;
    }
    // Handle HSL format
    if (color.startsWith('hsl')) {
        // For simplicity, return a default color
        // A complete implementation would convert HSL to hex
        return '#6366f1';
    }
    // Default fallback color
    return '#6366f1';
}
/**
 * Generate a color for a venue based on venue name
 */
function getVenueColor(venue) {
    // Specific colors for standard venues
    if (venue === 'Aspuddens IP 1') {
        return '#3b82f6'; // Blue
    }
    if (venue === 'Aspuddens IP 2') {
        return '#8b5cf6'; // Purple
    }
    if (venue === 'Västberga IP') {
        return '#ec4899'; // Pink
    }
    // For other venues, create a hash-based color
    const hash = venue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
}
/**
 * Generate a contrasting color based on a numerical value
 */
function getContrastingColor(value) {
    const hue = value % 360;
    return `hsl(${hue}, 70%, 50%)`;
}
/**
 * Check if a hex color is light (to determine text color)
 */
function isLightColor(color) {
    // Remove # if present
    const hex = color.replace('#', '');
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Calculate perceived brightness using the formula
    // (0.299*R + 0.587*G + 0.114*B)
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;
    // If brightness is greater than 155, color is considered light
    return brightness > 155;
}

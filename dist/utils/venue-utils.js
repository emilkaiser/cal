"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAspuddensIP = isAspuddensIP;
exports.isVastbergaIP = isVastbergaIP;
exports.isAspuddensIP1 = isAspuddensIP1;
exports.isAspuddensSkola = isAspuddensSkola;
exports.isAspuddensIP2 = isAspuddensIP2;
exports.isHomeVenue = isHomeVenue;
exports.extractVenues = extractVenues;
/**
 * Determine if a location is Aspuddens IP
 * @param location - Location to check
 * @returns true if the location is Aspuddens IP
 */
function isAspuddensIP(location) {
    if (!location)
        return false;
    const normalized = location.toLowerCase();
    return normalized.includes('aspudden');
}
/**
 * Determine if a location is Västberga IP
 * @param location - Location to check
 * @returns true if the location is Västberga IP
 */
function isVastbergaIP(location) {
    if (!location)
        return false;
    const normalized = location.toLowerCase();
    return normalized.includes('västberga') || normalized.includes('vastberga');
}
/**
 * Determine if a location is Aspuddens IP 1
 * @param location - Location string to check
 * @returns true if the location is Aspuddens IP 1
 */
function isAspuddensIP1(location) {
    if (!location)
        return false;
    const normalized = location.toLowerCase();
    return (normalized.includes('aspuddens ip 1') ||
        normalized.includes('aspuddens ip 11') ||
        normalized.includes('aspuddens ip 12'));
}
function isAspuddensSkola(location) {
    if (!location)
        return false;
    const normalized = location.toLowerCase();
    return normalized.includes('aspuddens skola');
}
function isAspuddensIP2(location) {
    if (!location)
        return false;
    const normalized = location.toLowerCase();
    return (normalized.includes('aspuddens ip 2') ||
        normalized.includes('aspuddens ip 25') ||
        normalized.includes('aspuddens ip 26'));
}
/**
 * Determine if a location is a home venue
 * @param location - Location to check
 * @returns true if the location is one of our home venues
 */
function isHomeVenue(location) {
    if (!location)
        return false;
    // Direct check for our home venues
    const normalized = location.toLowerCase();
    return (normalized.includes('aspudden') ||
        normalized.includes('västberga') ||
        normalized.includes('vastberga'));
}
/**
 * Get location categories from a location string
 * @param location - The location string
 * @returns Array of location categories (for Aspuddens IP and Västberga IP venues)
 */
function extractVenues(location) {
    if (!location)
        return [];
    const categories = [];
    if (isAspuddensSkola(location)) {
        categories.push('Aspuddens Skola');
        return categories;
    }
    if (isAspuddensIP(location)) {
        categories.push('Aspuddens IP');
        if (isAspuddensIP1(location)) {
            categories.push('Aspuddens IP 1');
        }
        else if (isAspuddensIP2(location)) {
            categories.push('Aspuddens IP 2');
        }
    }
    if (isVastbergaIP(location)) {
        categories.push('Västberga IP');
    }
    return categories;
}

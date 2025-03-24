import { CalendarEvent } from './ics-converter';

/**
 * Normalize a location string by removing common words and standardizing format
 * @param location - The location string to normalize
 * @returns Normalized location string
 */
export function normalizeLocation(location?: string): string | null {
  if (!location) return null;

  // Convert to lowercase for consistent processing
  let normalized = location.toLowerCase();

  // Extract the main part of the location if it contains parentheses
  // e.g., "ASPUDDENS IP (mot basketplan och löparbana)" -> "ASPUDDENS IP"
  const parenthesisIndex = normalized.indexOf('(');
  if (parenthesisIndex > 0) {
    normalized = normalized.substring(0, parenthesisIndex).trim();
  }

  // Replace multiple spaces with a single space
  normalized = normalized.replace(/\s+/g, ' ');

  // Trim whitespace
  normalized = normalized.trim();

  return normalized;
}

/**
 * Determine if a location is Aspuddens IP
 * @param location - Location to check
 * @returns true if the location is Aspuddens IP
 */
export function isAspuddensIP(location?: string): boolean {
  if (!location) return false;
  const normalized = location.toLowerCase();
  return normalized.includes('aspudden');
}

/**
 * Determine if a location is Västberga IP
 * @param location - Location to check
 * @returns true if the location is Västberga IP
 */
export function isVastbergaIP(location?: string): boolean {
  if (!location) return false;
  const normalized = location.toLowerCase();
  return normalized.includes('västberga') || normalized.includes('vastberga');
}

/**
 * Determine if a location is Aspuddens IP 1
 * @param location - Location string to check
 * @returns true if the location is Aspuddens IP 1
 */
export function isAspuddensIP1(location?: string): boolean {
  if (!location) return false;
  const normalized = location.toLowerCase();
  return (
    normalized.includes('aspuddens ip 1') ||
    normalized.includes('aspuddens ip 11') ||
    normalized.includes('aspuddens ip 12')
  );
}

/**
 * Determine if a location is Aspuddens IP 2
 * @param location - Location string to check
 * @returns true if the location is Aspuddens IP 2
 */
export function isAspuddensIP2(location?: string): boolean {
  if (!location) return false;
  const normalized = location.toLowerCase();
  return (
    normalized.includes('aspuddens ip 2') ||
    normalized.includes('aspuddens ip 25') ||
    normalized.includes('aspuddens ip 26')
  );
}

/**
 * Determine if a location is Västberga IP 1
 * @param location - Location string to check
 * @returns true if the location is Västberga IP 1
 */
export function isVastbergaIP1(location?: string): boolean {
  if (!location) return false;
  const normalized = location.toLowerCase();
  return normalized.includes('västberga ip 1') || normalized.includes('vastberga ip 1');
}

/**
 * Determine if a location is a home venue
 * @param location - Location to check
 * @returns true if the location is one of our home venues
 */
export function isHomeVenue(location?: string): boolean {
  if (!location) return false;
  const normalized = normalizeLocation(location);
  return normalized ? normalized.includes('aspudden') || normalized.includes('västberga') : false;
}

/**
 * Get location categories from a location string
 * @param location - The location string
 * @returns Array of location categories (for Aspuddens IP and Västberga IP venues)
 */
export function getLocationCategories(location?: string): string[] {
  if (!location) return [];

  const categories: string[] = [];

  // Process Aspuddens IP locations
  if (isAspuddensIP(location)) {
    // Add general Aspuddens IP category
    categories.push('Aspuddens IP');

    // Add specific field categories
    if (isAspuddensIP1(location)) {
      categories.push('Aspuddens IP 1');
    } else if (isAspuddensIP2(location)) {
      categories.push('Aspuddens IP 2');
    } else if (location.toLowerCase().includes('aspuddens ip')) {
      // If it has a specific number that's not 1 or 2
      const match = location.match(/aspuddens ip (\d+)/i);
      if (match && match[1]) {
        categories.push(`Aspuddens IP ${match[1]}`);
      }
    }
  }

  // Process Västberga IP locations
  if (isVastbergaIP(location)) {
    // Add general Västberga IP category
    categories.push('Västberga IP');

    // Add specific field categories
    if (isVastbergaIP1(location)) {
      categories.push('Västberga IP 1');
    } else if (
      location.toLowerCase().includes('västberga ip') ||
      location.toLowerCase().includes('vastberga ip')
    ) {
      // If it has a specific number
      const match = location.match(/v[aä]stberga ip (\d+)/i);
      if (match && match[1]) {
        categories.push(`Västberga IP ${match[1]}`);
      }
    }
  }

  return categories;
}

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

export function isAspuddensSkola(location?: string): boolean {
  if (!location) return false;
  const normalized = location.toLowerCase();
  return normalized.includes('aspuddens skola');
}

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
 * Determine if a location is a home venue
 * @param location - Location to check
 * @returns true if the location is one of our home venues
 */
export function isHomeVenue(location?: string): boolean {
  if (!location) return false;

  // Direct check for our home venues
  const normalized = location.toLowerCase();
  return (
    normalized.includes('aspudden') ||
    normalized.includes('västberga') ||
    normalized.includes('vastberga')
  );
}

/**
 * Get location categories from a location string
 * @param location - The location string
 * @returns Array of location categories (for Aspuddens IP and Västberga IP venues)
 */
export function extractVenues(location?: string): string[] {
  if (!location) return [];

  const categories: string[] = [];

  if (isAspuddensSkola(location)) {
    categories.push('Aspuddens Skola');
    return categories;
  }

  if (isAspuddensIP(location)) {
    categories.push('Aspuddens IP');

    if (isAspuddensIP1(location)) {
      categories.push('Aspuddens IP 1');
    } else if (isAspuddensIP2(location)) {
      categories.push('Aspuddens IP 2');
    }
  }

  if (isVastbergaIP(location)) {
    categories.push('Västberga IP');
  }

  return categories;
}

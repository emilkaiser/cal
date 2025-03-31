/**
 * Extracts the team color from the team name
 * @param teamName Team name like "P2014 Blå", "F2016 Röd", or "IFK Aspudden-Tellus Gul 3"
 * @returns The color as a capitalized string or "unknown"
 */
export function getColorFromTeamName(teamName: string): string {
  if (!teamName) return 'unknown';

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

function capitalizeFirstLetter(val: string): string {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

/**
 * Determines the gender from the team name
 * @param teamName Team name like "P2014 Blå" or "F2016 Röd"
 * @returns "Flickor", "Pojkar", "Dam", "Herr" or "unknown"
 */
export function getGenderFromTeamName(
  teamName: string
): 'unknown' | 'Flickor' | 'Pojkar' | 'Dam' | 'Herr' {
  if (!teamName) return 'unknown';

  // Handle case insensitivity by converting to lowercase
  const lowerCaseTeam = teamName.toLowerCase();

  // Check for "Dam" or "Herr" in team name
  if (lowerCaseTeam.includes('dam')) return 'Dam';
  if (lowerCaseTeam.includes('herr') || lowerCaseTeam.includes('herrjunior')) return 'Herr';

  // Make sure we match standalone P/F followed by digits, not partial matches like PF2014
  if (/\bp\d{2,4}\b/i.test(lowerCaseTeam)) return 'Pojkar';
  if (/\bf\d{2,4}\b/i.test(lowerCaseTeam)) return 'Flickor';

  // Also match team formats like "Team P-2014"
  if (/\bp[-]?\d{2,4}/i.test(lowerCaseTeam)) return 'Pojkar';
  if (/\bf[-]?\d{2,4}/i.test(lowerCaseTeam)) return 'Flickor';

  return 'unknown';
}

/**
 * Extracts the age group from the team name
 * @param teamName Team name like "P2014 Blå" or "F2016 Röd" or "P15"
 * @returns The year or age as a string or "unknown"
 */
export function getAgeGroupFromTeamName(teamName: string): string {
  if (!teamName) return 'unknown';

  // Look for 4-digit year after P or F, with possible dash
  const yearMatch = teamName.match(/[PF][-]?(\d{4})\b/i);
  if (yearMatch) return yearMatch[1];

  // Look for 2-digit age after P or F
  const ageMatch = teamName.match(/[PF](\d{1,2})\b/i);
  if (ageMatch) return ageMatch[1];

  return 'unknown';
}

/**
 * Maps color names to hex color codes
 * @param color Color name as a lowercase string
 * @returns Hex color code
 */
export function getHexColor(color: string): string {
  // Normalize color name by capitalizing first letter and lowercasing the rest
  const normalizedColor = color ? color.charAt(0).toUpperCase() + color.slice(1).toLowerCase() : '';

  switch (normalizedColor) {
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

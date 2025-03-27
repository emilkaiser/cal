/**
 * Extracts the team color from the team name
 * @param teamName Team name like "P2014 Blå" or "F2016 Röd"
 * @returns The color as a lowercase string or "unknown"
 */
export function getColorFromTeamName(teamName: string): string {
  const parts = teamName.split(' ');
  // Only return the last part if there's more than one part (i.e., there's a color)
  if (parts.length > 1) {
    const lastPart = parts.pop()?.toLowerCase() || '';
    // Check if the last part is likely a color
    if (['blå', 'röd', 'vit', 'svart', 'gul'].includes(lastPart)) {
      return capitalizeFirstLetter(lastPart);
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
 * @returns "Flickor", "Pojkar", or "unknown"
 */
export function getGenderFromTeamName(teamName: string): 'unknown' | 'Flickor' | 'Pojkar' {
  if (teamName.match(/F\d{4}/)) return 'Flickor';
  if (teamName.match(/P\d{4}/)) return 'Pojkar';
  return 'unknown';
}

/**
 * Extracts the age group from the team name
 * @param teamName Team name like "P2014 Blå" or "F2016 Röd"
 * @returns The year as a string or "unknown"
 */
export function getAgeGroupFromTeamName(teamName: string): string {
  const match = teamName.match(/(P|F)(\d{4})/);
  return match ? match[2] : 'unknown';
}

/**
 * Maps color names to hex color codes
 * @param color Color name as a lowercase string
 * @returns Hex color code
 */
export function getHexColor(color: string): string | undefined {
  switch (color) {
    case 'Blå':
      return '#007bff';
    case 'Röd':
      return '#dc3545';
    case 'Vit':
      return '#ffffff';
    case 'Svart':
      return 'grey';
    case 'Gul':
      return '#ffc107';
    default:
      return undefined;
  }
}

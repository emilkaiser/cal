import {
  BOYS,
  BOYS_GIRLS,
  Gender,
  GIRLS,
  MEN,
  MEN_JUNIOR,
  MEN_VETERAN,
  WOMEN,
  WOMEN_JUNIOR,
  WOMEN_VETERAN,
} from '../../types/types';

export function getColorFromTeamName(teamName: string): string | undefined {
  if (!teamName) return undefined;

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

  return undefined;
}

function capitalizeFirstLetter(val: string): string {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function getGenderFromTeamName(teamName: string): undefined | Gender {
  if (!teamName) return undefined;

  // Handle case insensitivity by converting to lowercase
  const lowerCaseTeam = teamName.toLowerCase();

  // Check for "Dam" or "Herr" in team name
  if (lowerCaseTeam.includes('veteran dam')) return WOMEN_VETERAN;
  if (lowerCaseTeam.includes('veteran herr')) return MEN_VETERAN;

  if (lowerCaseTeam.includes('damjunior')) return WOMEN_JUNIOR;
  if (lowerCaseTeam.includes('herrjunior')) return MEN_JUNIOR;

  // Check for "Dam" or "Herr" in team name
  if (lowerCaseTeam.includes('dam')) return WOMEN;
  if (lowerCaseTeam.includes('herr')) return MEN;

  // Check for mixed gender teams (PF pattern)
  if (/\bpf\d{2,4}\b/i.test(lowerCaseTeam)) return BOYS_GIRLS;

  // Make sure we match standalone P/F followed by digits, not partial matches like PF2014
  if (/\bp\d{2,4}\b/i.test(lowerCaseTeam)) return BOYS;
  if (/\bf\d{2,4}\b/i.test(lowerCaseTeam)) return GIRLS;

  // Also match team formats like "Team P-2014"
  if (/\bp[-]?\d{2,4}/i.test(lowerCaseTeam)) return BOYS;
  if (/\bf[-]?\d{2,4}/i.test(lowerCaseTeam)) return GIRLS;

  return undefined;
}

export function getGenderFromStructuredData(
  genderName: string,
  ageCategoryName: string
): Gender | undefined {
  if (!ageCategoryName || !genderName) return undefined;
  const lowerCaseAgeCategory = ageCategoryName.toLowerCase();
  const lowerCaseGender = genderName.toLowerCase();

  if (lowerCaseGender.includes('man') && lowerCaseAgeCategory.includes('veteran'))
    return MEN_VETERAN;
  if (lowerCaseGender.includes('kvinna') && lowerCaseAgeCategory.includes('veteran'))
    return WOMEN_VETERAN;

  if (lowerCaseGender.includes('man') && lowerCaseAgeCategory.includes('ungdom')) return MEN_JUNIOR;
  if (lowerCaseGender.includes('kvinna') && lowerCaseAgeCategory.includes('ungdom'))
    return WOMEN_JUNIOR;

  if (lowerCaseGender.includes('man') && lowerCaseAgeCategory.includes('barn')) return BOYS;
  if (lowerCaseGender.includes('kvinna') && lowerCaseAgeCategory.includes('barn')) return GIRLS;

  if (lowerCaseGender.includes('man') && lowerCaseAgeCategory.includes('senior')) return MEN;
  if (lowerCaseGender.includes('kvinna') && lowerCaseAgeCategory.includes('senior')) return WOMEN;

  return undefined;
}

export function getAgeGroupFromTeamName(teamName: string): string | undefined {
  if (!teamName) return undefined;

  // Look for 4-digit year after P or F, with possible dash
  const yearMatch = teamName.match(/[PF][-]?(\d{4})\b/i);
  if (yearMatch) return yearMatch[1];

  // Look for 2-digit age after P or F
  const ageMatch = teamName.match(/[PF](\d{1,2})\b/i);
  if (ageMatch) return ageMatch[1];

  return undefined;
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

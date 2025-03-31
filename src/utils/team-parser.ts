import { Gender } from '../types/types';
import { getColorFromTeamName } from './team-metadata';

/**
 * Extract and format team information from match titles or team names
 * @param title Match title or team name
 * @param gender Optional gender information to use if can't be determined from title
 * @param ageGroup Optional age group to use if can't be determined from title
 * @returns Object with team data
 */
export function extractTeamInfo(title: string, gender?: 'Pojkar' | 'Flickor', ageGroup?: string) {
  // Variables to store extracted values
  let rawTeam: string | undefined;
  let formattedTeam: string | undefined;

  // Extract raw team name from match title
  if (title) {
    // For match titles like "Match IFK Aspudden-Tellus Blå 1 - Hammarby IF FF 4 grön"
    const matchPattern = /Match\s+(IFK\s+Aspudden-Tellus\s+[^-]+)(?:\s+-|$)/i;
    // Also look for team name at start of title - "IFK Aspudden-Tellus Blå vs Team B"
    const teamVsPattern = /(IFK\s+Aspudden-Tellus\s+[^\s]+)\s+(?:vs|VS|mot)\s+/i;
    // For laget.se titles - "P2014 Blå vs Team B"
    const ageTeamPattern = /([PF]\d{4}\s+[^\s]+)\s+(?:vs|VS|mot)\s+/i;

    const teamMatch =
      title.match(matchPattern) || title.match(teamVsPattern) || title.match(ageTeamPattern);

    if (teamMatch) {
      rawTeam = teamMatch[1].trim();

      // Extract color from raw team name
      const color = getColorFromTeamName(rawTeam);

      // If we have both gender and age group, create a formatted team name
      if (gender && ageGroup) {
        formattedTeam = createFormattedTeamName(gender, ageGroup, color);
      } else {
        // Try to extract gender and age group from the raw team name
        const extractedGender = rawTeam.startsWith('P')
          ? 'Pojkar'
          : rawTeam.startsWith('F')
          ? 'Flickor'
          : undefined;
        const ageMatch = rawTeam.match(/\d{4}/);
        const extractedAge = ageMatch ? ageMatch[0] : undefined;

        if (extractedGender && extractedAge) {
          formattedTeam = createFormattedTeamName(extractedGender, extractedAge, color);
        } else {
          // If we still can't determine, use the raw team name
          formattedTeam = rawTeam;
        }
      }
    } else if (gender && ageGroup) {
      // If no match pattern found but we have gender and age group, create a formatted team name
      const color = getColorFromTeamName(title);
      formattedTeam = createFormattedTeamName(gender, ageGroup, color);
    }
  }

  return { rawTeam, formattedTeam };
}

/**
 * Create a formatted team name (like P2015 Blå) from components
 * @param gender 'Pojkar', 'Flickor', 'Dam', 'Herr', etc.
 * @param ageGroup Year like "2015" or age like "15"
 * @param color Team color like "Blå"
 * @returns Formatted team name
 */
export function createFormattedTeamName(
  gender?: Gender,
  ageGroup?: string,
  color?: string
): string | undefined {
  if (!gender || !ageGroup) return undefined;

  // Normalize gender to handle case variations
  const normalizedGender = gender.toLowerCase();
  let prefix = '';

  if (normalizedGender === 'pojkar' || normalizedGender === 'p') {
    prefix = 'P';
  } else if (normalizedGender === 'flickor' || normalizedGender === 'f') {
    prefix = 'F';
  } else if (normalizedGender === 'dam') {
    return `Dam${color && color !== 'unknown' ? ` ${color}` : ''}`;
  } else if (normalizedGender === 'herr') {
    return `Herr${color && color !== 'unknown' ? ` ${color}` : ''}`;
  } else {
    // If we can't determine the prefix, use the first letter
    prefix = gender.charAt(0).toUpperCase();
  }

  const colorSuffix = color && color !== 'unknown' ? ` ${color}` : '';
  return `${prefix}${ageGroup}${colorSuffix}`;
}

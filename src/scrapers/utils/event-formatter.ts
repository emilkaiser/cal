import {
  Activity,
  CUP,
  Match,
  MATCH_AWAY,
  MATCH_EXTERNAL,
  MATCH_HOME,
  OTHER,
  TRAINING,
} from '../../types/types';

/**
 * Formats event title with appropriate icons based on event type
 */
export function formatEventTitle(
  formattedTeam: string,
  originalTitle: string = '', // Add default value to avoid undefined
  activity?: Activity,
  match?: Match,
  opponent?: string,
  homeTeam?: string,
  awayTeam?: string
): string {
  // Handle empty formattedTeam edge case
  if (!formattedTeam && originalTitle) {
    return ` (${originalTitle})`;
  }

  if (!formattedTeam && !originalTitle) {
    return '';
  }

  // Handle training events
  if (activity === TRAINING) {
    return `⚽ ${formattedTeam}`;
  }

  // Don't show match formatting for "Övrigt" activities
  if (activity === OTHER) {
    if (originalTitle && !originalTitle.includes(formattedTeam)) {
      return `${formattedTeam} (${originalTitle})`;
    }
    return formattedTeam;
  }

  // Clean up opponent name if it exists
  let cleanOpponent = opponent;
  if (cleanOpponent && cleanOpponent.startsWith('Match ')) {
    cleanOpponent = cleanOpponent.substring(6);
  }
  if (cleanOpponent) {
    cleanOpponent = cleanOpponent.trim();
  }

  // Handle match events
  if (match !== undefined && match !== null) {
    // Handle special cases for empty string
    if ((match as unknown as string) === '') {
      return cleanOpponent ? `⚽ ${formattedTeam} (vs ${cleanOpponent})` : `⚽ ${formattedTeam}`;
    }

    // Handle standard match types
    if (match === MATCH_HOME) {
      return cleanOpponent ? `🏟️ ${formattedTeam} (vs ${cleanOpponent})` : `🏟️ ${formattedTeam}`;
    } else if (match === MATCH_AWAY) {
      return cleanOpponent ? `✈️ ${formattedTeam} (vs ${cleanOpponent})` : `✈️ ${formattedTeam}`;
    } else if (match === MATCH_EXTERNAL) {
      // For external matches, show both teams if available
      if (homeTeam && awayTeam) {
        return `🏟️ External (${homeTeam} vs ${awayTeam})`;
      }
      // Fallback to original title if team names aren't available
      return `🏟️ External (${originalTitle})`;
    } else {
      // Generic match with no home/away distinction
      return cleanOpponent ? `⚽ ${formattedTeam} (vs ${cleanOpponent})` : `⚽ ${formattedTeam}`;
    }
  }

  // When opponent is provided, treat as a generic match even if match type is undefined
  if (cleanOpponent) {
    return `⚽ ${formattedTeam} (vs ${cleanOpponent})`;
  }

  // cup
  if (activity === CUP) {
    return `🏆 ${formattedTeam} (${originalTitle})`;
  }

  // Default: Use team name and original title if it adds information
  if (originalTitle && !originalTitle.includes(formattedTeam)) {
    return `${formattedTeam} (${originalTitle})`;
  }

  return formattedTeam;
}

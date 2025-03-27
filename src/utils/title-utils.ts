import { Activity, Match } from '../types/types';

/**
 * Formats event title with appropriate icons based on event type
 */
export function formatEventTitle(
  team: string,
  originalTitle: string,
  activity?: Activity,
  match?: Match,
  opponent?: string
): string {
  // Handle training events
  if (activity === 'Träning') {
    return `⚽ ${team}`;
  }

  // Don't show match formatting for "Övrigt" activities
  if (activity === 'Övrigt') {
    if (originalTitle && !originalTitle.includes(team)) {
      return `${team} (${originalTitle})`;
    }
    return team;
  }

  // Handle match events
  if (match) {
    // Clean up opponent name if it exists
    let cleanOpponent = opponent;
    if (cleanOpponent && cleanOpponent.startsWith('Match ')) {
      cleanOpponent = cleanOpponent.substring(6).trim();
    }

    if (match === 'Home') {
      return cleanOpponent ? `🆚🏠 ${team} (vs ${cleanOpponent})` : `🆚🏠 ${team}`;
    } else if (match === 'Away') {
      return cleanOpponent ? `🆚🚍 ${team} (vs ${cleanOpponent})` : `🆚🚍 ${team}`;
    } else {
      // Generic match with no home/away distinction
      return cleanOpponent ? `🆚 ${team} (vs ${cleanOpponent})` : `🆚 ${team}`;
    }
  }

  // Default: Use team name and original title if it adds information
  if (originalTitle && !originalTitle.includes(team)) {
    return `${team} (${originalTitle})`;
  }

  return team;
}

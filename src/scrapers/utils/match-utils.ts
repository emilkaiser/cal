import {
  CalendarEvent,
  MATCH,
  Match,
  MATCH_AWAY,
  MATCH_EXTERNAL,
  MATCH_HOME,
  TRAINING,
} from '../../types/types';
import { isHomeVenue } from './venue-utils';

// Our team names for pattern matching
const TEAM_NAMES = ['IFK Aspudden-Tellus', 'IFK AT', 'AT', 'Aspudden', 'Tellus'];

// Aspudden-affiliated teams
const ASPUDDEN_TEAMS = [/IFK Aspudden-Tellus/i, /Aspuddens FF/i];

/**
 * Extract team names from event title
 * @param title Event title to parse
 * @returns Object containing home and away teams, or null if parsing failed
 */
function extractTeamsFromTitle(title: string): { homeTeam: string; awayTeam: string } | null {
  if (!title) {
    return null;
  }

  // Look for "vs" pattern or team name followed by dash
  const vsPattern = /(.+?)\s+(?:vs|VS|mot)\s+(.+?)$/;
  const dashPattern = /(.+?)\s+-\s+(.+?)$/;

  // Try to extract teams from the title using vs pattern first
  const vsMatch = title.match(vsPattern);
  if (vsMatch) {
    // Format is "Team1 vs Team2"
    return {
      homeTeam: vsMatch[1].trim(),
      awayTeam: vsMatch[2].trim(),
    };
  }

  // Clean up title by removing "Match" prefix only if it is at the start
  let cleanTitle = title;
  if (cleanTitle.startsWith('Match ')) {
    cleanTitle = cleanTitle.substring(6).trim();
  }

  // Try dash pattern with cleaned title
  const dashMatch = cleanTitle.match(dashPattern);
  if (dashMatch) {
    // Format is "Team1 - Team2"
    return {
      homeTeam: dashMatch[1].trim(),
      awayTeam: dashMatch[2].trim(),
    };
  }

  // Fallback: If no patterns match, return null
  return null;
}

/**
 * Escape special characters in a string for use in a regular expression
 * @param str String to escape
 * @returns Escaped string
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if a team name matches one of our team names
 * @param teamName Team name to check
 * @returns true if it matches one of our teams
 */
function isOurTeam(teamName: string): boolean {
  const teamNameLower = teamName.toLowerCase();

  // Use word-boundary regex for each team name
  for (const team of TEAM_NAMES) {
    const regex = new RegExp('\\b' + escapeRegExp(team.toLowerCase()) + '\\b', 'i');
    if (regex.test(teamNameLower)) {
      return true;
    }
  }

  // Handle special cases like "AT F2014 Gul"
  if (
    teamNameLower.includes('at ') ||
    teamNameLower.includes('tellus ') ||
    teamNameLower.startsWith('at ') ||
    teamNameLower.startsWith('tellus ')
  ) {
    return true;
  }

  return false;
}

/**
 * Determine if a team is an Aspudden team
 * @param teamName Team name to check
 * @returns true if the team is from Aspudden
 */
export function isAspuddenTeam(teamName: string): boolean {
  // Skip empty team names and generic teams like "Ospecificerat lag"
  if (!teamName || teamName.includes('Ospecificerat lag')) {
    return false;
  }

  return ASPUDDEN_TEAMS.some(pattern => pattern.test(teamName)) || isOurTeam(teamName);
}

/**
 * Determine if the match is home, away or external based on team names
 * @param homeTeam Home team name
 * @param awayTeam Away team name
 * @returns MATCH_HOME, MATCH_AWAY or 'External'
 */
export function determineMatchStatus(homeTeam: string, awayTeam: string): Match {
  const isHomeTeamAspudden = isAspuddenTeam(homeTeam);
  const isAwayTeamAspudden = isAspuddenTeam(awayTeam);

  if (isHomeTeamAspudden && !isAwayTeamAspudden) {
    return MATCH_HOME;
  } else if (!isHomeTeamAspudden && isAwayTeamAspudden) {
    return MATCH_AWAY;
  } else if (isHomeTeamAspudden && isAwayTeamAspudden) {
    // For internal matches between two Aspudden teams, return Home
    return MATCH_HOME;
  } else {
    // Neither team is an Aspudden team (completely external match)
    return MATCH_EXTERNAL;
  }
}

/**
 * Extract team from a match with home and away teams
 * @param homeTeam Home team name
 * @param awayTeam Away team name
 * @returns Aspudden team name or undefined if no Aspudden team is found
 */
export function extractTeamFromMatch(homeTeam: string, awayTeam: string): string | undefined {
  if (isAspuddenTeam(homeTeam)) {
    return homeTeam;
  } else if (isAspuddenTeam(awayTeam)) {
    return awayTeam;
  }
  return undefined;
}

/**
 * Extract opponent from match based on match status
 * @param homeTeam Home team name
 * @param awayTeam Away team name
 * @param matchStatus Whether Aspudden is playing at home or away
 * @returns Opponent team name or undefined
 */
export function extractOpponentFromMatch(
  homeTeam: string,
  awayTeam: string,
  matchStatus: Match
): string | undefined {
  if (matchStatus === MATCH_HOME) {
    return awayTeam;
  } else if (matchStatus === MATCH_AWAY) {
    return homeTeam;
  }
  return undefined;
}

export function getHomeAwayCategory(event: CalendarEvent): Match | undefined {
  // Skip if not a sport event or already categorized
  if (!event.title) {
    return undefined;
  }

  if (event.activity !== MATCH) {
    return undefined;
  }

  // Skip if event has categories with Home or Away
  if (event.categories && Array.isArray(event.categories)) {
    if (event.categories.includes(MATCH_HOME) || event.categories.includes(MATCH_AWAY)) {
      return undefined;
    }
  }

  // Skip if event already has match property set
  if (event.match === MATCH_HOME || event.match === MATCH_AWAY) {
    return undefined;
  }

  const teams = extractTeamsFromTitle(event.title);

  if (teams) {
    const isHomeTeamOurs = isOurTeam(teams.homeTeam);
    const isAwayTeamOurs = isOurTeam(teams.awayTeam);

    if (isHomeTeamOurs && !isAwayTeamOurs) {
      return MATCH_HOME;
    } else if (!isHomeTeamOurs && isAwayTeamOurs) {
      return MATCH_AWAY;
    }
  }

  // If location contains our venue, it's likely a home game
  if (event.location && isHomeVenue(event.location)) {
    return MATCH_HOME;
  } else if (event.location && event.location.trim() !== '') {
    // Only assume away if we couldn't determine it's a home venue
    return MATCH_AWAY;
  }

  return undefined;
}

/**
 * Extract the opponent team name from an event title
 * @param event Calendar event
 * @returns The name of the opponent team or undefined if it can't be determined
 */
export function getOpponent(event: CalendarEvent): string | undefined {
  if (!event.title) {
    return undefined;
  }

  if (event.activity !== MATCH) {
    return undefined;
  }

  const teams = extractTeamsFromTitle(event.title);

  if (!teams) {
    return undefined;
  }

  // Check if our team is the home team
  const isHomeTeamOurs = isOurTeam(teams.homeTeam);

  // Check if our team is the away team
  const isAwayTeamOurs = isOurTeam(teams.awayTeam);

  // If it's our team vs our team (internal match), return undefined
  if (isHomeTeamOurs && isAwayTeamOurs) {
    return undefined;
  }

  // Return the opponent team name
  if (isHomeTeamOurs) {
    return teams.awayTeam;
  } else if (isAwayTeamOurs) {
    return teams.homeTeam;
  }

  return undefined;
}

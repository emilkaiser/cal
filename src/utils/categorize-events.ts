import { CalendarEvent } from './ics-converter';
import { isHomeVenue } from './location-utils';

// Load team names from configuration
const TEAM_NAMES = ['IFK Aspudden-Tellus', 'IFK AT', 'Aspudden', 'Tellus'];

// Common event types in calendars
export const EVENT_TYPES = {
  MATCH: 'Match',
  TRAINING: 'Träning',
  CUP: 'Cup',
  TOURNAMENT: 'Turnering',
  MEETING: 'Möte',
  EVENT: 'Event',
  OTHER: 'Övrigt',
};

/**
 * Identifies if a match is home or away and adds the appropriate category
 * @param event The calendar event to categorize
 * @returns "Home", "Away" or undefined if not categorizable
 */
export function getHomeAwayCategory(event: CalendarEvent): 'Home' | 'Away' | undefined {
  // Skip if not a sport event or already categorized
  if (!event.title || event.categories?.includes('Home') || event.categories?.includes('Away')) {
    return undefined;
  }

  const teamNames = TEAM_NAMES.map(name => name.toLowerCase());

  // Look for "vs" pattern or team name followed by dash
  const vsPattern = /(.+?)\s+(?:vs|VS|mot)\s+(.+?)$/;
  const dashPattern = /(.+?)\s+-\s+(.+?)$/;

  let homeTeam = '';
  let awayTeam = '';

  // Try to extract teams from the title
  const vsMatch = event.title.match(vsPattern);
  const dashMatch = !vsMatch && event.title.match(dashPattern);

  if (vsMatch) {
    // Format is "Team1 vs Team2"
    homeTeam = vsMatch[1].trim();
    awayTeam = vsMatch[2].trim();
  } else if (dashMatch) {
    // Format is "Team1 - Team2"
    homeTeam = dashMatch[1].trim();
    awayTeam = dashMatch[2].trim();
  }

  if (homeTeam && awayTeam) {
    // Check if our team is the home team
    const isHome = teamNames.some(name => homeTeam.toLowerCase().includes(name));

    // Check if our team is the away team
    const isAway = teamNames.some(name => awayTeam.toLowerCase().includes(name));

    if (isHome && !isAway) {
      return 'Home';
    } else if (isAway && !isHome) {
      return 'Away';
    }
  }

  // If location contains our venue, it's likely a home game
  if (event.location && isHomeVenue(event.location)) {
    return 'Home';
  } else if (event.location && event.location.trim() !== '') {
    // If there's a location and it's not our home field, assume it's away
    return 'Away';
  }

  return undefined;
}

/**
 * Identifies the type of event (Match, Training, etc.) from title or categories
 * @param event The calendar event to categorize
 * @returns Event type string or undefined if not determinable
 */
export function getEventType(event: CalendarEvent): string | undefined {
  if (!event.title) {
    return undefined;
  }

  // First check if the event already has a category that matches an event type
  if (event.categories && event.categories.length > 0) {
    for (const category of event.categories) {
      const eventType = Object.values(EVENT_TYPES).find(
        type => category.toLowerCase() === type.toLowerCase()
      );
      if (eventType) {
        return eventType;
      }
    }
  }

  // Check if the title starts with any of the known event types
  const title = event.title.trim();
  for (const [_, prefix] of Object.entries(EVENT_TYPES)) {
    if (
      title.toLowerCase().startsWith(`${prefix.toLowerCase()} - `) ||
      title.toLowerCase().startsWith(`${prefix.toLowerCase()}: `)
    ) {
      return prefix;
    }
  }

  // Look for specific patterns in the title
  if (
    title.toLowerCase().includes(' vs ') ||
    title.toLowerCase().includes(' mot ') ||
    /\s+-\s+/.test(title)
  ) {
    return EVENT_TYPES.MATCH;
  }

  if (title.toLowerCase().includes('träning') || title.toLowerCase().includes('training')) {
    return EVENT_TYPES.TRAINING;
  }

  if (title.toLowerCase().includes('cup')) {
    return EVENT_TYPES.CUP;
  }

  if (title.toLowerCase().includes('turnering')) {
    return EVENT_TYPES.TOURNAMENT;
  }

  if (title.toLowerCase().includes('möte') || title.toLowerCase().includes('mote')) {
    return EVENT_TYPES.MEETING;
  }

  return undefined;
}

/**
 * Formats the title based on the event type
 * @param title Original title
 * @param eventType Type of event
 * @param teamName Team name
 * @returns Formatted title
 */
export function formatEventTitle(
  title: string,
  eventType: string | undefined,
  teamName: string
): string {
  if (!eventType) {
    return `${teamName} - ${title}`;
  }

  // Remove event type prefix if present
  let cleanTitle = title;
  for (const [_, prefix] of Object.entries(EVENT_TYPES)) {
    if (title.startsWith(`${prefix} - `) || title.startsWith(`${prefix}: `)) {
      cleanTitle = title.replace(`${prefix} - `, '').replace(`${prefix}: `, '');
      break;
    }
  }

  if (eventType === EVENT_TYPES.TRAINING) {
    return `${teamName} - Träning`;
  }

  if (eventType === EVENT_TYPES.MATCH) {
    const matchPattern = /(.+?)\s+-\s+(.+?)$/;
    const matchResult = cleanTitle.match(matchPattern);

    if (matchResult) {
      const [_, team1, team2] = matchResult;

      // Check if our team is the home or away team
      if (team1.includes(teamName) || team1.includes('IFK Aspudden-Tellus')) {
        return `${teamName} vs ${team2}`;
      } else {
        return `${teamName} vs ${team1}`;
      }
    }
  }

  // Default case for other event types
  return `${teamName} - ${cleanTitle}`;
}

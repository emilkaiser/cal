import { Activity, CalendarEvent } from '../types/types';
import { isHomeVenue, extractVenues } from './location-utils';

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

export function getHomeAwayCategory(event: CalendarEvent): 'home' | 'away' | undefined {
  // Skip if not a sport event or already categorized
  if (!event.title || event.categories?.includes('home') || event.categories?.includes('away')) {
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
      return 'home';
    } else if (isAway && !isHome) {
      return 'away';
    }
  }

  // If location contains our venue, it's likely a home game
  if (event.location && isHomeVenue(event.location)) {
    return 'home';
  } else if (event.location && event.location.trim() !== '') {
    // If there's a location and it's not our home field, assume it's away
    return 'away';
  }

  return undefined;
}

export function getEventType(event: CalendarEvent): Activity | undefined {
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
        return eventType as Activity;
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
      return prefix as Activity;
    }
  }

  // Look for specific patterns in the title
  if (
    title.toLowerCase().includes(' vs ') ||
    title.toLowerCase().includes(' mot ') ||
    /\s+-\s+/.test(title)
  ) {
    return EVENT_TYPES.MATCH as Activity;
  }

  if (title.toLowerCase().includes('träning') || title.toLowerCase().includes('training')) {
    return EVENT_TYPES.TRAINING as Activity;
  }

  if (title.toLowerCase().includes('cup')) {
    return EVENT_TYPES.CUP as Activity;
  }

  if (title.toLowerCase().includes('turnering')) {
    return EVENT_TYPES.TOURNAMENT as Activity;
  }

  if (title.toLowerCase().includes('möte') || title.toLowerCase().includes('mote')) {
    return EVENT_TYPES.MEETING as Activity;
  }

  return undefined;
}

function extractTeamInfo(title: string): {
  homeTeam?: string;
  awayTeam?: string;
  isMatch: boolean;
  baseTeamName: string;
} {
  // Extract age group and team color if present (like "P2011 Gul")
  const teamNameMatch = title.match(
    /\b([PF]\d{2,4}(?:\s+(?:Gul|Röd|Blå|Grön|Svart|Vit|Gröna|Blåa|Röda|Gula|Svarta|Vita|[A-Z]))?)\b/i
  );
  let baseTeamName = teamNameMatch ? teamNameMatch[1] : '';

  // Check if it's a match (contains "vs", "mot", "Match")
  const vsMatch = title.match(/(.+?)(?:\s+(?:vs|VS|mot|Match)\s+)(.+)/i);
  if (vsMatch) {
    // If the match has a specific team name from earlier, use it, otherwise use the match group
    const homeTeam = baseTeamName || vsMatch[1].trim();

    return {
      homeTeam: homeTeam,
      awayTeam: vsMatch[2].trim(),
      isMatch: true,
      baseTeamName: homeTeam,
    };
  }

  // Check if team name is before a dash (common format in Swedish events)
  const dashMatch = title.match(/^(.+?)\s*-\s*(.+)$/);
  if (dashMatch) {
    // If we already found a specific team name (like P2011 Gul), use it
    const homeTeam = baseTeamName || dashMatch[1].trim();

    return {
      homeTeam: homeTeam,
      isMatch: dashMatch[2].toLowerCase().includes('match'),
      baseTeamName: homeTeam,
    };
  }

  // If we found a team name like P2011 Gul earlier, use it
  if (baseTeamName) {
    return {
      homeTeam: baseTeamName,
      isMatch: title.toLowerCase().includes('match'),
      baseTeamName: baseTeamName,
    };
  }

  // Just return the full title as the team name as a fallback
  return {
    homeTeam: title,
    isMatch: false,
    baseTeamName: title,
  };
}

export function extractAgeGroup(title: string): string | undefined {
  // Look for P or F followed by 2 digits
  const ageMatch = title.match(/\b([PF])(\d{2})\b/i);
  if (ageMatch) {
    return `${ageMatch[1].toUpperCase()}${ageMatch[2]}`;
  }

  // Try to find year groups (birth years)
  const yearMatch = title.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    return yearMatch[1];
  }

  return undefined;
}

function extractGender(title: string): 'Pojkar' | 'Flickor' | 'unknown' {
  const lowerTitle = title.toLowerCase();

  // Check for explicit gender indicators
  if (/\b(herr|herrar|pojk|p\d{2}|p20\d{2})\b/.test(lowerTitle)) {
    return 'Pojkar';
  }

  if (/\b(dam|damer|flick|f\d{2}|f20\d{2})\b/.test(lowerTitle)) {
    return 'Flickor';
  }

  // Look for P or F followed by numbers which indicates age group by gender
  // Check for P followed by 2-4 digits at the beginning of a word
  if (/\bP(?:\d{2}|\d{4})\b/i.test(title)) {
    return 'Pojkar';
  }

  // Check for F followed by 2-4 digits at the beginning of a word
  if (/\bF(?:\d{2}|\d{4})\b/i.test(title)) {
    return 'Flickor';
  }

  return 'unknown';
}

function extractTeamName(title: string): string | undefined {
  // First check for "TEAM vs OPPONENT" pattern
  const vsMatch = title.match(/^(.*?)\s+(?:vs|VS|mot)\s+/);
  if (vsMatch && vsMatch[1]) {
    return vsMatch[1].trim();
  }

  // Then check for common patterns like "TEAM - EVENT"
  const dashMatch = title.match(/^(.*?)(?:\s*[-:]\s*)/);
  if (dashMatch && dashMatch[1]) {
    return dashMatch[1].trim();
  }

  return undefined;
}

import * as path from 'path';
import * as fs from 'fs/promises';
import { saveEventsToJson } from '../utils/calendar-io';
import { isAspuddensIP1, isAspuddensIP2, isVastbergaIP, extractVenues } from '../utils/venue-utils';
import { CalendarEvent } from '../types/types';
import { extractAgeGroup } from '../utils/event-categorizer';
import { getActivityTypeFromCategories } from '../utils/activity-utils';
import { formatEventTitle } from '../utils/event-formatter';
import {
  determineMatchStatus,
  extractTeamFromMatch,
  extractOpponentFromMatch,
} from '../utils/match-utils';
import { getColorFromTeamName } from '../utils/team-metadata';
import { createFormattedTeamName, extractTeamInfo } from '../utils/team-parser';
import { buildFilterTags } from '../utils/filter-utils';

// Define resource IDs for the venues we want to fetch
const RESOURCE_IDS = [15452, 15469]; // Aspuddens IP and Västberga IP
const BASE_URL = 'https://www.stff.se/api/venue/getmatches/?facilityMatchesId=';

interface Match {
  id: number;
  location: string;
  category: string;
  date: {
    iso8601: string;
    formatted: string;
  };
  home: {
    team: string;
    logo?: {
      src: string;
      alt: string;
    };
  };
  away: {
    team: string;
    logo?: {
      src: string;
      alt: string;
    };
  };
  note?: string;
  url: string;
  ageCategoryName?: string;
  ageCategoryId?: number;
  genderName?: string;
  genderId?: number;
}

interface MatchesResponse {
  matches: Match[];
}

// 1. Fetch data from external source
async function fetchBookings(): Promise<Match[]> {
  const allMatches: Match[] = [];

  for (const resourceId of RESOURCE_IDS) {
    const url = `${BASE_URL}${resourceId}`;
    console.log(`Fetching matches from ${url}`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Failed to fetch from ${url}: ${response.status} ${response.statusText}`);
        continue; // Skip this resource but continue with others
      }

      const data: MatchesResponse = await response.json();
      console.log(
        `Found ${data.matches.length} matches from venue API (resource ID: ${resourceId})`
      );

      // Add matches from this resource to our collection
      allMatches.push(...data.matches);
    } catch (error) {
      console.error(`Error fetching from resource ID ${resourceId}:`, error);
      // Continue with other resources even if one fails
    }
  }

  console.log(`Total matches fetched: ${allMatches.length}`);
  return allMatches;
}

// 2. Transform into source-specific format
function transformToSourceData(matches: Match[]): CalendarEvent[] {
  console.log('Transforming matches to source data events');

  return matches.map(match => {
    // Parse the ISO date string from the API
    const startDate = new Date(match.date.iso8601);

    // Create an end date 1.5 hours after start time
    const endDate = new Date(startDate.getTime() + 90 * 60000); // 90 minutes

    const title = `${match.home.team} vs ${match.away.team}`;
    const description = `${match.category}${match.note ? ` - ${match.note}` : ''}`;

    return {
      uid: `venue-match-${match.id}`,
      start: startDate,
      end: endDate,
      title,
      description,
      location: match.location,
      url: `https://www.stff.se${match.url}`,
      categories: [match.category],
      sourceType: 'venue',
      rawData: match,
    };
  });
}

// Source-specific enhancement
function enhanceSourceEvents(events: CalendarEvent[]): CalendarEvent[] {
  console.log('Applying venue-specific enhancements to events');

  return events.map(event => {
    // Make a copy to avoid modifying the original
    const enhancedEvent = { ...event };

    if (event.rawData) {
      const match = event.rawData as Match;

      // Extract gender information
      if (match.genderName) {
        enhancedEvent.gender =
          match.genderName === 'Man'
            ? 'Pojkar'
            : match.genderName === 'Kvinna'
            ? 'Flickor'
            : undefined;
      }

      // Extract age group from category - only the year part
      if (match.category) {
        enhancedEvent.ageGroup = extractAgeGroup(match.category);
      }

      // Extract venues from location
      if (match.location) {
        enhancedEvent.venues = extractVenues(match.location);
      }

      // Determine match status based on team names
      const matchStatus = determineMatchStatus(match.home.team, match.away.team);
      enhancedEvent.match = matchStatus === 'External' ? 'External' : matchStatus;

      // Extract raw team name - only if it's an Aspudden team
      const rawTeam = extractTeamFromMatch(match.home.team, match.away.team);
      if (rawTeam) {
        // Store rawTeam for consistency with laget-scraper
        enhancedEvent.rawTeam = rawTeam;

        // The team property is the same as rawTeam in venue-scraper
        enhancedEvent.team = rawTeam;

        // Extract team color if we have a team
        enhancedEvent.color = getColorFromTeamName(rawTeam);

        // Create formatted team name using the utility
        enhancedEvent.formattedTeam = createFormattedTeamName(
          enhancedEvent.gender,
          enhancedEvent.ageGroup,
          enhancedEvent.color
        );

        // If we couldn't create a formatted team name, use the raw team
        if (!enhancedEvent.formattedTeam) {
          enhancedEvent.formattedTeam = rawTeam;
        }
      }

      // Extract opponent
      enhancedEvent.opponent = extractOpponentFromMatch(
        match.home.team,
        match.away.team,
        matchStatus
      );

      // Always set activity to "Match" for venue events
      enhancedEvent.activity = 'Match';

      // Add formatted title - use formattedTeam instead of team
      enhancedEvent.formattedTitle = formatEventTitle(
        enhancedEvent.formattedTeam || '',
        enhancedEvent.title,
        enhancedEvent.activity,
        enhancedEvent.match,
        enhancedEvent.opponent,
        match.home.team,
        match.away.team
      );
    }

    return enhancedEvent;
  });
}

// 3. Enhance events with utilities
function enhanceEvents(events: CalendarEvent[]): CalendarEvent[] {
  console.log('Enhancing events with categories and metadata');

  return events.map(event => {
    const enhancedEvent = { ...event };

    // Add filter tags
    enhancedEvent.filterTags = buildFilterTags(enhancedEvent);

    // Remove temporary rawTeam property after it's been used
    delete enhancedEvent.rawTeam;

    return enhancedEvent;
  });
}

// Filter helpers
function filterIP1Events(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter(event => event.location && isAspuddensIP1(event.location));
}

function filterIP2Events(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter(event => event.location && isAspuddensIP2(event.location));
}

function filterVastbergaEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter(event => event.location && isVastbergaIP(event.location));
}

// 4. Main process
async function main() {
  try {
    // Step 1: Create venue data directory
    const dataDir = path.join('data', 'venue');
    await fs.mkdir(dataDir, { recursive: true });

    // Step 2: Fetch raw data from external sources and merge
    const matches = await fetchBookings();

    // Step 3: Transform raw data into source events
    const sourceEvents = transformToSourceData(matches);

    // Step 4: Apply venue-specific enhancements to events
    const enhancedSourceEvents = enhanceSourceEvents(sourceEvents);

    // Step 5: Apply general enhancements
    const finalEvents = enhanceEvents(enhancedSourceEvents);

    // Step 6: Save all events
    await saveEventsToJson(finalEvents, path.join(dataDir, 'all.json'));
    console.log(`Saved ${finalEvents.length} total events to data/venue/all.json`);

    // Step 7: Filter and save IP1 events
    const ip1Events = filterIP1Events(finalEvents);
    await saveEventsToJson(ip1Events, path.join(dataDir, 'aspuddens-ip-1.json'));
    console.log(`Saved ${ip1Events.length} IP1 events to data/venue/aspuddens-ip-1.json`);

    // Step 8: Filter and save IP2 events
    const ip2Events = filterIP2Events(finalEvents);
    await saveEventsToJson(ip2Events, path.join(dataDir, 'aspuddens-ip-2.json'));
    console.log(`Saved ${ip2Events.length} IP2 events to data/venue/aspuddens-ip-2.json`);

    // Step 9: Filter and save Västberga events
    const vastbergaEvents = filterVastbergaEvents(finalEvents);
    await saveEventsToJson(vastbergaEvents, path.join(dataDir, 'vastberga-ip.json'));
    console.log(
      `Saved ${vastbergaEvents.length} Västberga IP events to data/venue/vastberga-ip.json`
    );
  } catch (error) {
    console.error('Error processing venue data:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { fetchBookings, transformToSourceData, enhanceSourceEvents, type Match };

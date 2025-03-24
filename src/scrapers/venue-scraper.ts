import * as path from 'path';
import * as fs from 'fs/promises';
import { CalendarEvent, saveEventsToJson } from '../utils/ics-converter';
import { getHomeAwayCategory } from '../utils/categorize-events';
import {
  getLocationCategories,
  isAspuddensIP1,
  isAspuddensIP2,
  isVastbergaIP,
} from '../utils/location-utils';

const RESOURCE_ID = 15452;
const BASE_URL = `https://www.stff.se/api/venue/getmatches/?facilityMatchesId=${RESOURCE_ID}`;

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
  };
  away: {
    team: string;
  };
  note?: string;
  url: string;
}

interface MatchesResponse {
  matches: Match[];
}

// 1. Fetch data from external source
async function fetchBookings(): Promise<Match[]> {
  console.log(`Fetching matches from ${BASE_URL}`);
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const data: MatchesResponse = await response.json();
  console.log(`Found ${data.matches.length} matches from venue API`);

  return data.matches;
}

// 2. Transform into common interface
function transformToCalendarEvents(matches: Match[]): CalendarEvent[] {
  console.log('Transforming matches to calendar events');

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
    };
  });
}

// 3. Enhance events with utilities
function enhanceEvents(events: CalendarEvent[]): CalendarEvent[] {
  console.log('Enhancing events with categories and metadata');

  return events.map(event => {
    // Deep clone to avoid mutating the original object
    const enhancedEvent = JSON.parse(JSON.stringify(event)) as CalendarEvent;

    // Add Home/Away category
    const homeAway = getHomeAwayCategory(enhancedEvent);
    if (homeAway) {
      enhancedEvent.categories = enhancedEvent.categories || [];
      if (!enhancedEvent.categories.includes(homeAway)) {
        enhancedEvent.categories.push(homeAway);
      }
    }

    // Add location-based categories
    if (enhancedEvent.location) {
      const locationCategories = getLocationCategories(enhancedEvent.location);
      if (locationCategories.length > 0) {
        enhancedEvent.categories = enhancedEvent.categories || [];
        for (const category of locationCategories) {
          if (!enhancedEvent.categories.includes(category)) {
            enhancedEvent.categories.push(category);
          }
        }
      }
    }

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
    // Ensure data directory exists
    const dataDir = path.join('data', 'venue');
    await fs.mkdir(dataDir, { recursive: true });

    // Step 1: Fetch raw data
    const matches = await fetchBookings();

    // Step 2: Transform to common format
    const basicEvents = transformToCalendarEvents(matches);

    // Step 3: Enhance with utilities
    const enhancedEvents = enhanceEvents(basicEvents);

    // Step 4: Save filtered datasets

    // All events
    await saveEventsToJson(enhancedEvents, path.join(dataDir, 'all.json'));
    console.log(`Saved ${enhancedEvents.length} total events to data/venue/all.json`);

    // IP1 matches
    const ip1Events = filterIP1Events(enhancedEvents);
    await saveEventsToJson(ip1Events, path.join(dataDir, 'aspuddens-ip-1.json'));
    console.log(`Saved ${ip1Events.length} IP1 events to data/venue/aspuddens-ip-1.json`);

    // IP2 matches
    const ip2Events = filterIP2Events(enhancedEvents);
    await saveEventsToJson(ip2Events, path.join(dataDir, 'aspuddens-ip-2.json'));
    console.log(`Saved ${ip2Events.length} IP2 events to data/venue/aspuddens-ip-2.json`);

    // Västberga IP matches
    const vastbergaEvents = filterVastbergaEvents(enhancedEvents);
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

export { fetchBookings, transformToCalendarEvents, enhanceEvents };

// Add type declaration for node-ical
declare module 'node-ical' {
  export function parseICS(icsData: string): Promise<Record<string, ICalEvent>>;
}

import { JSDOM } from 'jsdom';
import * as ical from 'node-ical';
import * as path from 'path';
import * as fs from 'fs/promises';
import { CalendarEvent, saveEventsToJson } from '../utils/ics-converter';
import { getHomeAwayCategory, getEventType, formatEventTitle } from '../utils/categorize-events';
import { getLocationCategories } from '../utils/location-utils';

interface TeamInfo {
  name: string;
  slug: string;
}

interface ICalEvent {
  type: string;
  uid: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  url?: string;
  categories?: string | string[];
  geo?: {
    lat: number;
    lon: number;
  };
  status?: string;
  dtstamp?: Date;
}

// 1. Fetch data from external source
async function fetchTeamSlugs(): Promise<TeamInfo[]> {
  console.log('Fetching team slugs from IFK Aspudden-Tellus website...');
  const url = 'https://www.ifkaspudden-tellus.se/';

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Target the correct team items from the popover structure
  const teamListItems = document.querySelectorAll('.teamsPopover__listItemOuter');
  console.log(`Found ${teamListItems.length} team list items`);

  const teams: TeamInfo[] = [];

  teamListItems.forEach(item => {
    const linkElement = item.querySelector('.teamsPopover__listItemInner');
    const nameElement = item.querySelector('.popoverList__teamName');

    if (linkElement && nameElement) {
      const name = nameElement.textContent?.trim() || '';
      const href = linkElement.getAttribute('href') || '';

      if (href && name) {
        // Extract the slug from the laget.se URL
        const slug = href.replace('https://www.laget.se/', '');

        if (slug) {
          teams.push({
            name,
            slug,
          });
        }
      }
    }
  });

  console.log(`Found ${teams.length} teams`);
  teams.forEach(team => console.log(`- ${team.name} (${team.slug})`));
  return teams;
}

function generateIcsUrl(slug: string): string {
  return `https://cal.laget.se/${slug}.ics`;
}

async function fetchIcsCalendar(url: string): Promise<Record<string, any>> {
  console.log(`Fetching calendar from ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch calendar: ${response.status} ${response.statusText}`);
      return {};
    }

    const icsContent = await response.text();
    return await ical.parseICS(icsContent);
  } catch (error) {
    console.error(`Error fetching or parsing calendar from ${url}:`, error);
    return {};
  }
}

// 2. Transform to common format
function transformToCalendarEvent(event: ICalEvent, teamName: string): CalendarEvent | null {
  if (event.type !== 'VEVENT' || !event.start || !event.end) {
    return null;
  }

  // Extract categories from the event
  let categories: string[] = [];

  // Use the event categories if available
  if (event.categories) {
    const eventCategories = Array.isArray(event.categories) ? event.categories : [event.categories];
    categories = eventCategories.filter(Boolean);
  }

  // Get the title
  let title = event.summary || 'Unnamed event';

  // Create basic event
  const calEvent: CalendarEvent = {
    uid: event.uid || `laget-${Math.random().toString(36).substring(2)}`,
    title,
    start: event.start,
    end: event.end,
    description:
      event.description !== '[[[]]]' && event.description !== '' ? event.description : undefined,
    location: event.location,
    url: event.url,
    categories: categories.length > 0 ? categories : undefined,
  };

  return calEvent;
}

// 3. Enhance events with utilities
function enhanceEvents(events: CalendarEvent[], teamName: string): CalendarEvent[] {
  return events.map(event => {
    // Deep clone to avoid mutating the original object
    const enhancedEvent = JSON.parse(JSON.stringify(event)) as CalendarEvent;

    // Determine event type and add as category if not present
    const eventType = getEventType(enhancedEvent);
    if (eventType && (!enhancedEvent.categories || !enhancedEvent.categories.includes(eventType))) {
      enhancedEvent.categories = enhancedEvent.categories || [];
      enhancedEvent.categories.push(eventType);
    }

    // Format the title based on event type
    enhancedEvent.title = formatEventTitle(enhancedEvent.title, eventType, teamName);

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

// 4. Main process
async function main() {
  try {
    // Create output directory if it doesn't exist
    const dataDir = path.join('data', 'laget');
    await fs.mkdir(dataDir, { recursive: true });

    // Step 1: Fetch team slugs
    const teams = await fetchTeamSlugs();

    const allEvents: CalendarEvent[] = [];

    // Process each team
    for (const team of teams) {
      // Step 1: Fetch calendar data
      const icsUrl = generateIcsUrl(team.slug);
      const calendar = await fetchIcsCalendar(icsUrl);

      // Step 2: Transform to calendar events
      const teamEvents: CalendarEvent[] = [];
      for (const eventId in calendar) {
        const calendarEvent = transformToCalendarEvent(calendar[eventId], team.name);
        if (calendarEvent) {
          teamEvents.push(calendarEvent);
        }
      }

      console.log(`Found ${teamEvents.length} events for team ${team.name}`);

      // Step 3: Enhance events
      const enhancedEvents = enhanceEvents(teamEvents, team.name);

      // Add to collection
      allEvents.push(...enhancedEvents);

      // Save individual team calendar
      const teamFilePath = path.join(dataDir, `${team.slug}.json`);
      await saveEventsToJson(enhancedEvents, teamFilePath);
      console.log(`Saved ${enhancedEvents.length} events for ${team.name} to ${teamFilePath}`);
    }

    // Step 4: Save all events
    if (allEvents.length > 0) {
      const jsonFilePath = path.join(dataDir, 'calendar.json');
      await saveEventsToJson(allEvents, jsonFilePath);
      console.log(`Laget data saved to ${jsonFilePath} with ${allEvents.length} total events`);
    } else {
      console.log('No events found, no data file was created.');
    }
  } catch (error) {
    console.error('Error processing laget data:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { fetchTeamSlugs, fetchIcsCalendar, transformToCalendarEvent, enhanceEvents };

import { JSDOM } from 'jsdom';
import * as ical from 'node-ical';
import * as path from 'path';
import * as fs from 'fs/promises';
import { saveEventsToJson } from '../utils/ics-converter';
import { EventSourceData } from '../utils/event-normalizer';
import {
  getColorFromTeamName,
  getGenderFromTeamName,
  getAgeGroupFromTeamName,
} from '../utils/team-utils';
import { extractVenues } from '../utils/location-utils';
import { getActivityTypeFromCategories } from '../utils/activity-utils';
import { getHomeAwayCategory, getOpponent } from '../utils/match-utils';
import { formatEventTitle } from '../utils/title-utils';
import { CalendarEvent } from '../types/types';
// Import ICalEvent from our type declaration
import { ICalEvent } from 'node-ical';

interface TeamInfo {
  name: string;
  slug: string;
}

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

async function fetchIcsCalendar(url: string): Promise<Record<string, ICalEvent>> {
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

function transformLagetEvents(events: Record<string, ICalEvent>): CalendarEvent[] {
  const sourceEvents: EventSourceData[] = [];

  for (const eventId in events) {
    // Skip non-VEVENT entries (like VTIMEZONE)
    const event = events[eventId];
    if (event.type !== 'VEVENT') {
      continue;
    }

    const sourceEvent: CalendarEvent = {
      uid: event.uid,
      title: event.summary || 'Unnamed event',
      start: event.start,
      end: event.end,
      description: event.description,
      location: event.location,
      categories: Array.isArray(event.categories)
        ? event.categories
        : event.categories
        ? [event.categories]
        : undefined,
      sourceType: 'laget',
      rawData: event,
    };

    sourceEvents.push(sourceEvent);
  }

  return sourceEvents;
}

function enhanceLagetEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.map(event => {
    const activity = getActivityTypeFromCategories(event.categories);
    const match = getHomeAwayCategory(event);
    const opponent = getOpponent(event);
    const venues = extractVenues(event.location);

    return {
      ...event,
      activity,
      venues,
      match,
      opponent,
    };
  });
}

function getTeamMeta(teamName: string) {
  const color = getColorFromTeamName(teamName);
  const meta = {
    team: teamName,
    color,
    gender: getGenderFromTeamName(teamName),
    ageGroup: getAgeGroupFromTeamName(teamName),
  };
  return meta;
}

/**
 * Generate filter tags based on event properties
 */
function buildFilterTags(event: CalendarEvent): string[] {
  const filterTags: string[] = [];

  // Team tag
  if (event.team) {
    filterTags.push(`team:${event.team}`);
  }

  // Match type tag
  if (event.match) {
    filterTags.push(`match:${event.match}`);
  }

  // Location tags
  if (event.venues && event.venues.length > 0) {
    event.venues.forEach(venue => filterTags.push(`location:${venue}`));
  }

  // Activity/Category tag
  if (event.activity) {
    filterTags.push(`category:${event.activity}`);
  } else if (event.categories && event.categories.length > 0) {
    // Use the first category if activity is not available
    filterTags.push(`category:${event.categories[0]}`);
  }

  // Gender tag
  if (event.gender) {
    filterTags.push(`gender:${event.gender}`);
  }

  // Age group tag
  if (event.ageGroup) {
    filterTags.push(`ageGroup:${event.ageGroup}`);
  }

  // Color tag
  if (event.color) {
    filterTags.push(`color:${event.color}`);
  }

  return filterTags;
}

async function main() {
  try {
    // Create output directory if it doesn't exist
    const dataDir = path.join('data', 'laget');
    await fs.mkdir(dataDir, { recursive: true });

    // Step 1: Fetch team slugs
    //const teams = [{ slug: 'P2014B', name: 'P2014 Blå' }];
    const teams = await fetchTeamSlugs();

    const allEvents: CalendarEvent[] = [];

    // Process each team
    for (const team of teams) {
      // Step 1: Fetch calendar data
      const icsUrl = generateIcsUrl(team.slug);
      const calendar = await fetchIcsCalendar(icsUrl);

      // Step 2: Get team metadata
      const meta = getTeamMeta(team.name);

      // Step 3: Transform events
      const sourceEvents = transformLagetEvents(calendar);

      console.log(`Found ${sourceEvents.length} events for team ${team.name}`);

      // Step 4: Enhance each event
      const enhancedSourceEvents = enhanceLagetEvents(sourceEvents);

      // Step 5: Add to collection with metadata and filter tags
      allEvents.push(
        ...enhancedSourceEvents.map(e => {
          const eventWithMeta = {
            ...e,
            ...meta,
            url: icsUrl,
            // Format the title with appropriate icons
            formattedTitle: formatEventTitle(team.name, e.title, e.activity, e.match, e.opponent),
          };
          // Add filter tags to each event
          return {
            ...eventWithMeta,
            filterTags: buildFilterTags(eventWithMeta),
          };
        })
      );
    }

    // Step 6: Save all events
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

export {
  fetchTeamSlugs,
  fetchIcsCalendar,
  transformLagetEvents,
  enhanceLagetEvents,
  buildFilterTags,
};

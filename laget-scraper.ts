// Add type declaration for node-ical
declare module 'node-ical' {
  export function parseICS(icsData: string): Promise<Record<string, any>>;
}

import { writeFile } from 'fs/promises';
import { JSDOM } from 'jsdom';
import * as ical from 'node-ical';
import { createEvents, EventAttributes } from 'ics';

interface TeamInfo {
  name: string;
  slug: string;
}

interface ICalEvent {
  summary: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  uid?: string;
  url?: string;
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
  
  console.log('Extracting team information from the website...');
  
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
            slug
          });
        }
      }
    }
  });
  
  // If no teams found, use hardcoded fallback values
  if (teams.length === 0) {
    console.log('No teams found, using fallback values');
    teams.push(
      { name: 'A-lag Herrar', slug: 'IFKAT_herr' },
      { name: 'A-lag Damer', slug: 'IFKATdam' },
      { name: 'P2014 Blå', slug: 'P2014B' },
      { name: 'P2014 Röd', slug: 'P2014R' },
      { name: 'P2014 Gul', slug: 'IFKAT-P2014Gul' },
      { name: 'F2014 Gul', slug: 'IFKAT-F2014' },
      { name: 'F2014 Röd', slug: 'IFKAT-F2014R' }
    );
  }
  
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

function convertToIcsEvent(event: any, teamName: string): ICalEvent | null {
  if (event.type !== 'VEVENT' || !event.start || !event.end) {
    return null;
  }

  // Prefix the event summary with the team name
  const summary = `${teamName} - ${event.summary || 'Unnamed event'}`;

  return {
    summary,
    start: event.start,
    end: event.end,
    description: event.description,
    location: event.location,
    uid: event.uid,
    url: event.url
  };
}

function convertToIcsAttributes(event: ICalEvent): EventAttributes {
  const start = event.start;
  const end = event.end;

  return {
    start: [
      start.getFullYear(),
      start.getMonth() + 1,
      start.getDate(),
      start.getHours(),
      start.getMinutes()
    ] as [number, number, number, number, number],
    end: [
      end.getFullYear(),
      end.getMonth() + 1,
      end.getDate(),
      end.getHours(),
      end.getMinutes()
    ] as [number, number, number, number, number],
    title: event.summary,
    description: event.description,
    location: event.location,
    url: event.url,
    uid: event.uid || `laget-${Math.random().toString(36).substring(2)}`
  };
}

async function main() {
  // Fetch team slugs from the website
  const teams = await fetchTeamSlugs();
  
  // Create ICS URLs and fetch calendars
  const allEvents: ICalEvent[] = [];
  
  for (const team of teams) {
    const icsUrl = generateIcsUrl(team.slug);
    const calendar = await fetchIcsCalendar(icsUrl);
    
    // Convert events and add team name prefix
    for (const eventId in calendar) {
      const event = convertToIcsEvent(calendar[eventId], team.name);
      if (event) {
        allEvents.push(event);
      }
    }
  }
  
  console.log(`Total events found: ${allEvents.length}`);
  
  if (allEvents.length > 0) {
    // Convert to ICS format
    const icsEvents = allEvents.map(convertToIcsAttributes);
    
    // Create ICS file
    const { error, value } = createEvents(icsEvents);
    if (error) throw error;
    if (!value) throw new Error('No calendar data was generated');
    
    // Write to file
    const outputFile = 'laget-calendar.ics';
    await writeFile(outputFile, value);
    console.log(`Calendar saved to ${outputFile} with ${icsEvents.length} events`);
  } else {
    console.log('No events found, no calendar file was created.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

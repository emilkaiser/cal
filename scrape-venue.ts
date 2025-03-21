import { writeFile } from 'fs/promises';
import { createEvents, EventAttributes } from 'ics';

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

async function fetchBookings() {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  const data: MatchesResponse = await response.json();
  return data.matches;
}

function toICSData(matches: Match[]): EventAttributes[] {
  return matches.map(match => {
    // Parse the ISO date string from the API
    const startDate = new Date(match.date.iso8601);
    
    // Create an end date 1.5 hours after start time
    const endDate = new Date(startDate.getTime() + 90 * 60000); // 90 minutes in milliseconds
    
    const title = `${match.home.team} vs ${match.away.team}`;
    const description = `${match.category}${match.note ? ` - ${match.note}` : ''}`;

    return {
      start: [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes()
      ] as [number, number, number, number, number],
      end: [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes()
      ] as [number, number, number, number, number],
      title,
      description,
      location: match.location,
      url: `https://www.stff.se${match.url}`
    };
  });
}

function isIP1(match: Match): boolean {
  const location = match.location.toLowerCase();
  return (
    location.includes("aspuddens ip 1") || 
    location.includes("aspuddens ip 11") || 
    location.includes("aspuddens ip 12")
  );
}

function isIP2(match: Match): boolean {
  const location = match.location.toLowerCase();
  return (
    location.includes("aspuddens ip 2") || 
    location.includes("aspuddens ip 25") || 
    location.includes("aspuddens ip 26")
  );
}

async function createCalendar(events: EventAttributes[], filename: string) {
  const { error, value } = createEvents(events);
  if (error) throw error;
  if (!value) throw new Error('No calendar data was generated');

  await writeFile(filename, value);
  console.log(`Calendar ${filename} created with ${events.length} events`);
}

async function main() {
  const matches = await fetchBookings();
  
  // All matches
  const allEvents = toICSData(matches);
  await createCalendar(allEvents, 'all.ics');
  
  // IP1 matches
  const ip1Matches = matches.filter(isIP1);
  const ip1Events = toICSData(ip1Matches);
  await createCalendar(ip1Events, 'ip1.ics');
  
  // IP2 matches
  const ip2Matches = matches.filter(isIP2);
  const ip2Events = toICSData(ip2Matches);
  await createCalendar(ip2Events, 'ip2.ics');
}

main().catch(console.error);

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

async function main() {
  const matches = await fetchBookings();
  const events = toICSData(matches);

  const { error, value } = createEvents(events);
  if (error) throw error;
  if (!value) throw new Error('No calendar data was generated');

  await writeFile('calendar.ics', value);
  console.log(`Calendar created with ${events.length} events`);
}

main().catch(console.error);
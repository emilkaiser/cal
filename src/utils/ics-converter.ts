import { writeFile, readFile, mkdir } from 'fs/promises';
import { createEvents, EventAttributes } from 'ics';
import * as path from 'path';

export interface CalendarEvent {
  uid?: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  url?: string;
  categories?: string[];
}

export async function loadEventsFromJson(filePath: string): Promise<CalendarEvent[]> {
  try {
    const data = await readFile(filePath, 'utf8');
    const events = JSON.parse(data);
    
    // Convert string dates back to Date objects
    return events.map((event: any) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    }));
  } catch (error) {
    console.error(`Error loading events from ${filePath}:`, error);
    return [];
  }
}

export async function saveEventsToJson(events: CalendarEvent[], filePath: string): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  
  await writeFile(filePath, JSON.stringify(events, null, 2));
  console.log(`Saved ${events.length} events to ${filePath}`);
}

/**
 * Convert events to ICS format events
 * @param events - List of calendar events
 * @returns List of ICS format events
 */
export function toICSEvents(events: CalendarEvent[]): EventAttributes[] {
  return events.map(event => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    return {
      uid: event.uid,
      title: event.title,
      start: [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes(),
      ],
      end: [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes(),
      ],
      description: event.description,
      location: event.location,
      url: event.url,
      categories: event.categories,
    };
  });
}

export async function convertEventsToIcs(events: CalendarEvent[], outputPath: string): Promise<void> {
  if (events.length === 0) {
    console.log('No events to convert, skipping ICS creation');
    return;
  }

  const icsEvents = toICSEvents(events);
  
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  await mkdir(dir, { recursive: true });
  
  const { error, value } = createEvents(icsEvents);
  if (error) throw error;
  if (!value) throw new Error('No calendar data was generated');
  
  await writeFile(outputPath, value);
  console.log(`Calendar saved to ${outputPath} with ${icsEvents.length} events`);
}

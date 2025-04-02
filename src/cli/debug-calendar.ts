import * as fs from 'fs/promises';
import * as path from 'path';
import { CalendarEvent } from '../types/types';

async function printCalendarProperties() {
  try {
    // Path to calendar.json - try different potential locations
    const possiblePaths = [
      path.join(process.cwd(), 'data', 'laget', 'calendar.json'),
      path.join(process.cwd(), 'calendar.json'),
      path.join(__dirname, '..', '..', '..', 'data', 'laget', 'calendar.json'),
    ];

    // Find the first path that exists
    let filePath = '';
    let fileExists = false;

    for (const p of possiblePaths) {
      try {
        await fs.access(p);
        filePath = p;
        fileExists = true;
        console.log(`Found calendar.json at: ${p}`);
        break;
      } catch (err) {
        console.log(`File not found at: ${p}`);
      }
    }

    if (!fileExists) {
      console.error('ERROR: calendar.json file not found in any expected location.');
      return;
    }

    // Read the calendar data
    console.log(`Reading file from: ${filePath}`);
    const data = await fs.readFile(filePath, 'utf8');

    // Parse JSON
    console.log('Parsing JSON data...');
    let events: CalendarEvent[];
    try {
      events = JSON.parse(data) as CalendarEvent[];
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return;
    }

    if (!Array.isArray(events)) {
      console.error('ERROR: Data is not an array');
      console.log('Data type:', typeof events);
      return;
    }

    if (events.length === 0) {
      console.error('WARNING: No events found in the file');
      return;
    }

    console.log(`Found ${events.length} events in the file`);

    // Prepare data for table formatting
    const headers = [
      'title',
      'team',
      'activity',
      'match',
      'opponent',
      'gender',
      'ageGroup',
      'color',
      'formattedTeam',
      'formattedTitle',
    ];
    const rows: string[][] = [];

    // Collect data and determine max column widths
    const colWidths: number[] = headers.map(h => h.length);

    for (const event of events) {
      if (event && typeof event === 'object') {
        const row = [
          event.title || '',
          event.team || '',
          event.activity || '',
          event.match || '',
          event.opponent || '',
          event.gender || '',
          event.ageGroup || '',
          event.color || '',
          event.formattedTeam || '',
          event.formattedTitle || '',
        ];

        // Update column widths
        row.forEach((cell, i) => {
          colWidths[i] = Math.max(colWidths[i], cell.length);
        });

        rows.push(row);
      }
    }

    // Add some extra padding
    const paddedColWidths = colWidths.map(w => w + 2);

    // Print header
    console.log(headers.map((header, i) => header.padEnd(paddedColWidths[i])).join('│'));

    // Print separator
    console.log(paddedColWidths.map(width => '─'.repeat(width)).join('┼'));

    // Print rows
    for (const row of rows) {
      console.log(row.map((cell, i) => cell.padEnd(paddedColWidths[i])).join('│'));
    }

    console.log(`\nProcessed and displayed ${rows.length} events`);
  } catch (error) {
    console.error('Error processing calendar data:', error);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  console.log('Starting calendar debug script...');
  console.log('Current working directory:', process.cwd());
  printCalendarProperties()
    .then(() => console.log('Debug script completed'))
    .catch(error => console.error('Failed to run debug script:', error));
}

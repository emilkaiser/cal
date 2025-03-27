"use strict";
// import { readFile } from 'fs/promises';
// import { JSDOM } from 'jsdom';
// import * as path from 'path';
// import * as fs from 'fs/promises';
// import { CalendarEvent, saveEventsToJson } from '../utils/ics-converter';
// import { getHomeAwayCategory } from '../utils/categorize-events';
// import { getVenues } from '../utils/location-utils';
// import { EventSourceData, normalizeEvents } from '../utils/event-normalizer';
// // STFF API types
// interface TeamConfig {
//   teamId: number;
//   teamName: string;
// }
// interface ConfigGroup {
//   teams: TeamConfig[];
//   outputFile: string;
// }
// interface ConfigRoot {
//   configs: ConfigGroup[];
// }
// interface TeamResponse {
//   data: string;
//   nextUrl: string | null;
// }
// interface GameData {
//   id: string;
//   dateTime: string;
//   homeTeam: string;
//   awayTeam: string;
//   category: string;
//   location: string;
//   url: string;
// }
// // Default config
// const DEFAULT_CONFIG: ConfigRoot = {
//   configs: [],
// };
// // 1. Load configuration
// async function loadConfig(configPath: string = './team-config.json'): Promise<ConfigRoot> {
//   console.log(`Loading team configuration from ${configPath}`);
//   try {
//     const configData = await readFile(configPath, 'utf8');
//     const jsonData = JSON.parse(configData);
//     // Handle both formats: array of configs or object with configs array
//     if (Array.isArray(jsonData)) {
//       return { configs: jsonData };
//     } else if (jsonData.configs && Array.isArray(jsonData.configs)) {
//       return jsonData as ConfigRoot;
//     } else {
//       // Handle legacy format (single config)
//       return {
//         configs: [jsonData as ConfigGroup],
//       };
//     }
//   } catch (error) {
//     console.warn(`Could not load config from ${configPath}`, error);
//     return DEFAULT_CONFIG;
//   }
// }
// // Fetch data from external source
// async function fetchGamesPage(teamId: number, from: number = 0): Promise<TeamResponse> {
//   const requestUrl = `https://www.stff.se/api/team/upcoming-games/?teamId=${teamId}${
//     from ? `&from=${from}` : ''
//   }`;
//   console.log(`Fetching ${requestUrl}`);
//   const response = await fetch(requestUrl);
//   if (!response.ok) {
//     throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
//   }
//   return await response.json();
// }
// // Extract games from HTML
// function parseGamesFromHTML(html: string): GameData[] {
//   const dom = new JSDOM(html);
//   const document = dom.window.document;
//   const matchItems = document.querySelectorAll('.match-board__item');
//   const games: GameData[] = [];
//   matchItems.forEach((item: Element) => {
//     const link = item.querySelector('.match-link__match');
//     if (!link) return;
//     const url = link.getAttribute('href') || '';
//     const id = url.split('=')[1] || '';
//     const dateTimeElement = item.querySelector('time.match-link__date');
//     const dateTime = dateTimeElement?.getAttribute('datetime') || '';
//     const homeTeamElement = item.querySelector(
//       '.match-link__column--flags .team-logo:first-child img'
//     );
//     const homeTeam = homeTeamElement?.getAttribute('alt')?.replace(' emblem', '') || '';
//     const awayTeamElement = item.querySelector(
//       '.match-link__column--flags .team-logo:last-child img'
//     );
//     const awayTeam = awayTeamElement?.getAttribute('alt')?.replace(' emblem', '') || '';
//     const categoryElement = item.querySelector('.match-link__tag');
//     const category = categoryElement?.textContent?.trim() || '';
//     const eventElement = item.querySelector('.match-link__event');
//     const location = eventElement
//       ? eventElement.textContent
//           ?.trim()
//           ?.replace(/\d{2}:\d{2}/, '')
//           ?.trim() || ''
//       : '';
//     games.push({
//       id,
//       dateTime,
//       homeTeam,
//       awayTeam,
//       category,
//       location,
//       url: `https://www.stff.se${url}`,
//     });
//   });
//   return games;
// }
// // 2. Transform data to source-specific format
// function transformToSourceData(games: GameData[]): EventSourceData[] {
//   console.log(`Transforming ${games.length} games to source data events`);
//   return games.map(game => {
//     const startDate = new Date(game.dateTime);
//     const endDate = new Date(startDate.getTime() + 90 * 60000); // 90 minutes games
//     return {
//       uid: `team-game-${game.id}`,
//       start: startDate,
//       end: endDate,
//       title: `${game.homeTeam} vs ${game.awayTeam}`,
//       description: game.category,
//       location: game.location,
//       url: game.url,
//       categories: [game.category],
//       sourceType: 'team',
//       rawData: game,
//     };
//   });
// }
// // Source-specific enhancement
// function enhanceSourceEvents(events: EventSourceData[]): EventSourceData[] {
//   console.log('Applying team-specific enhancements to events');
//   return events.map(event => {
//     // Deep clone to avoid mutating the original object
//     const enhancedEvent = { ...event };
//     // Team-specific enhancements could go here
//     // For example, extracting specific data patterns from descriptions
//     return enhancedEvent;
//   });
// }
// // 3. Enhance events with utilities
// function enhanceEvents(events: CalendarEvent[]): CalendarEvent[] {
//   console.log('Enhancing events with categories and metadata');
//   return events.map(event => {
//     // Deep clone to avoid mutating the original object
//     const enhancedEvent = JSON.parse(JSON.stringify(event)) as CalendarEvent;
//     // Initialize categories array if it doesn't exist
//     enhancedEvent.categories = enhancedEvent.categories || [];
//     // Add Home/Away category
//     const homeAway = getHomeAwayCategory(enhancedEvent);
//     if (homeAway && !enhancedEvent.categories.includes(homeAway)) {
//       enhancedEvent.categories.push(homeAway);
//     }
//     // Add location-based categories
//     if (enhancedEvent.location) {
//       const locationCategories = getVenues(enhancedEvent.location);
//       if (locationCategories.length > 0) {
//         for (const category of locationCategories) {
//           if (!enhancedEvent.categories.includes(category)) {
//             enhancedEvent.categories.push(category);
//           }
//         }
//       }
//     }
//     return enhancedEvent;
//   });
// }
// // Fetch all games for a team
// async function fetchAllGamesForTeam(team: TeamConfig): Promise<GameData[]> {
//   let allGames: GameData[] = [];
//   let nextUrl: string | null = null;
//   let from = 0;
//   console.log(`Fetching games for team: ${team.teamName} (ID: ${team.teamId})`);
//   do {
//     const response = await fetchGamesPage(team.teamId, from);
//     const games = parseGamesFromHTML(response.data);
//     allGames = [...allGames, ...games];
//     nextUrl = response.nextUrl;
//     if (nextUrl) {
//       const match = nextUrl.match(/from=(\d+)/);
//       from = match ? parseInt(match[1]) : 0;
//     }
//   } while (nextUrl);
//   console.log(`Found ${allGames.length} games for team: ${team.teamName}`);
//   return allGames;
// }
// // 4. Process a team group config
// async function processTeamGroup(config: ConfigGroup): Promise<CalendarEvent[]> {
//   console.log(`Processing team group for ${config.outputFile}`);
//   let allGames: GameData[] = [];
//   for (const team of config.teams) {
//     console.log(`Processing team: ${team.teamName} (ID: ${team.teamId})`);
//     const games = await fetchAllGamesForTeam(team);
//     console.log(`Found ${games.length} upcoming games for ${team.teamName}`);
//     allGames = [...allGames, ...games];
//   }
//   // Transform to source format
//   const sourceEvents = transformToSourceData(allGames);
//   // Team-specific enhancement
//   const enhancedSourceEvents = enhanceSourceEvents(sourceEvents);
//   // Common normalization
//   const normalizedEvents = normalizeEvents(enhancedSourceEvents);
//   // Extract the filename without extension to use as JSON filename
//   const baseFilename = path.basename(config.outputFile, '.ics');
//   const jsonFilePath = path.join('data', 'team', `${baseFilename}.json`);
//   // Save the events
//   await saveEventsToJson(normalizedEvents, jsonFilePath);
//   console.log(`Team data saved to ${jsonFilePath} with ${normalizedEvents.length} events`);
//   return normalizedEvents;
// }
// // 5. Main process
// async function main(): Promise<void> {
//   try {
//     const args = process.argv.slice(2);
//     // Get config file path if provided
//     const configPathArg = args.find(arg => arg.startsWith('--config='));
//     const configPath = configPathArg
//       ? configPathArg.split('=')[1]
//       : path.join(process.cwd(), 'team-config.json');
//     // Check if we're in API fetch mode or combine mode
//     const fetchMode = args.includes('--fetch');
//     const combineMode = args.includes('--combine');
//     // Default to both modes if none specified
//     const doFetch = fetchMode || (!fetchMode && !combineMode);
//     const doCombine = combineMode || (!fetchMode && !combineMode);
//     // Create output directory if it doesn't exist
//     const outputDir = path.join('data', 'team');
//     await fs.mkdir(outputDir, { recursive: true });
//     // Load configuration
//     const configRoot = await loadConfig(configPath);
//     let allEvents: CalendarEvent[] = [];
//     // Process each config
//     if (doFetch) {
//       for (const config of configRoot.configs) {
//         const events = await processTeamGroup(config);
//         allEvents = [...allEvents, ...events];
//       }
//     } else {
//       // Load events from existing files
//       for (const config of configRoot.configs) {
//         const baseFilename = path.basename(config.outputFile, '.ics');
//         const jsonFilePath = path.join('data', 'team', `${baseFilename}.json`);
//         try {
//           const fileContent = await fs.readFile(jsonFilePath, 'utf8');
//           const events = JSON.parse(fileContent) as CalendarEvent[];
//           console.log(events);
//           // Convert string dates to Date objects
//           events.forEach(event => {
//             event.start = new Date(event.start);
//             event.end = new Date(event.end);
//           });
//           allEvents = [...allEvents, ...events];
//           console.log(`Loaded ${events.length} events from ${jsonFilePath}`);
//         } catch (error) {
//           console.error(`Error loading events from ${jsonFilePath}:`, error);
//         }
//       }
//     }
//     // Combine all events if needed
//     if (doCombine && allEvents.length > 0) {
//       const allTeamsPath = path.join(outputDir, 'all-teams.json');
//       await saveEventsToJson(allEvents, allTeamsPath);
//       console.log(`Saved ${allEvents.length} events from all teams to ${allTeamsPath}`);
//     }
//   } catch (error) {
//     console.error('Error processing team data:', error);
//   }
// }
// if (require.main === module) {
//   main().catch(console.error);
// }
// export {
//   fetchAllGamesForTeam,
//   parseGamesFromHTML,
//   transformToSourceData,
//   enhanceSourceEvents,
//   type GameData,
// };

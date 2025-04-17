import * as path from 'path';
import * as fs from 'fs/promises';
import { JSDOM } from 'jsdom';
import { saveEventsToJson } from './utils/calendar-io';
import { CalendarEvent } from '../types/types';
import {
  getColorFromTeamName,
  getGenderFromTeamName,
  getAgeGroupFromTeamName,
} from './utils/team-metadata';
import { createFormattedTeamName } from './utils/team-parser';
import { extractVenues } from './utils/venue-utils';
import { formatEventTitle } from './utils/event-formatter';
import { getHomeAwayCategory, getOpponent } from './utils/match-utils';

interface TeamConfig {
  teamId: number;
  teamName: string;
}

interface ConfigGroup {
  teams: TeamConfig[];
  outputFile: string;
}

interface ConfigRoot {
  configs: ConfigGroup[];
}

interface TeamResponse {
  data: string;
  nextUrl: string | null;
}

interface GameData {
  id: string;
  dateTime: string;
  homeTeam: string;
  awayTeam: string;
  category: string;
  location: string;
  url: string;
}

// 1. Load configuration
async function loadConfig(configPath: string = './team-config.json'): Promise<ConfigRoot> {
  console.log(`Loading team configuration from ${configPath}`);

  try {
    const configData = await fs.readFile(configPath, 'utf8');
    const jsonData = JSON.parse(configData);

    if (Array.isArray(jsonData)) {
      return { configs: jsonData };
    } else if (jsonData.configs && Array.isArray(jsonData.configs)) {
      return jsonData as ConfigRoot;
    } else {
      return {
        configs: [jsonData as ConfigGroup],
      };
    }
  } catch (error) {
    console.warn(`Could not load config from ${configPath}`, error);
    return { configs: [] };
  }
}

// Fetch data from external source
async function fetchGamesPage(teamId: number, from: number = 0): Promise<TeamResponse> {
  const requestUrl = `https://www.stff.se/api/team/upcoming-games/?teamId=${teamId}${
    from ? `&from=${from}` : ''
  }`;
  console.log(`Fetching ${requestUrl}`);

  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Extract games from HTML
function parseGamesFromHTML(html: string): GameData[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const matchItems = document.querySelectorAll('.match-board__item');

  const games: GameData[] = [];

  matchItems.forEach((item: Element) => {
    const link = item.querySelector('.match-link__match');
    if (!link) return;

    const url = link.getAttribute('href') || '';
    const id = url.split('=')[1] || '';

    const dateTimeElement = item.querySelector('time.match-link__date');
    const dateTime = dateTimeElement?.getAttribute('datetime') || '';

    const homeTeamElement = item.querySelector(
      '.match-link__column--flags .team-logo:first-child img'
    );
    const homeTeam = homeTeamElement?.getAttribute('alt')?.replace(' emblem', '') || '';

    const awayTeamElement = item.querySelector(
      '.match-link__column--flags .team-logo:last-child img'
    );
    const awayTeam = awayTeamElement?.getAttribute('alt')?.replace(' emblem', '') || '';

    const categoryElement = item.querySelector('.match-link__tag');
    const category = categoryElement?.textContent?.trim() || '';

    const eventElement = item.querySelector('.match-link__event');
    const location = eventElement
      ? eventElement.textContent
          ?.trim()
          ?.replace(/\d{2}:\d{2}/, '')
          ?.trim() || ''
      : '';

    games.push({
      id,
      dateTime,
      homeTeam,
      awayTeam,
      category,
      location,
      url: `https://www.stff.se${url}`,
    });
  });

  return games;
}

// 2. Transform into source-specific format
function transformToSourceData(games: GameData[]): CalendarEvent[] {
  return games.map(game => {
    const startDate = new Date(game.dateTime);
    const endDate = new Date(startDate.getTime() + 90 * 60000); // 90 minutes

    return {
      uid: `team-game-${game.id}`,
      start: startDate,
      end: endDate,
      title: `${game.homeTeam} vs ${game.awayTeam}`,
      description: game.category,
      location: game.location,
      url: game.url,
      categories: [game.category],
      sourceType: 'team',
      rawData: game,
    };
  });
}

// 3. Enhance events with team metadata and formatting
function enhanceSourceEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.map(event => {
    const game = event.rawData as GameData;
    const teamName = game.homeTeam;
    const color = getColorFromTeamName(teamName);
    const gender = getGenderFromTeamName(teamName);
    const ageGroup = getAgeGroupFromTeamName(teamName);

    let formattedTeam: string | undefined;
    if (gender && ageGroup) {
      formattedTeam = createFormattedTeamName(gender, ageGroup, color);
    }
    if (!formattedTeam) {
      formattedTeam = teamName;
    }

    const venues = extractVenues(event.location);
    const match = getHomeAwayCategory(event);
    const opponent = getOpponent(event);

    return {
      ...event,
      color,
      gender,
      ageGroup,
      formattedTeam,
      team: teamName,
      venues,
      match,
      opponent,
      activity: 'Match',
      formattedTitle: formatEventTitle(
        formattedTeam,
        event.title,
        'Match',
        match,
        opponent,
        game.homeTeam,
        game.awayTeam
      ),
    };
  });
}

// Remove temporary properties if any (for consistency with other scrapers)
function finalizeEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.map(event => {
    const e = { ...event };
    delete e.rawTeam;
    return e;
  });
}

// Fetch all games for a team
async function fetchAllGamesForTeam(team: TeamConfig): Promise<GameData[]> {
  let allGames: GameData[] = [];
  let nextUrl: string | null = null;
  let from = 0;

  do {
    const response = await fetchGamesPage(team.teamId, from);
    const games = parseGamesFromHTML(response.data);
    allGames = [...allGames, ...games];

    nextUrl = response.nextUrl;
    if (nextUrl) {
      const match = nextUrl.match(/from=(\d+)/);
      from = match ? parseInt(match[1]) : 0;
    }
  } while (nextUrl);

  return allGames;
}

// 4. Main process
async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    const configPathArg = args.find(arg => arg.startsWith('--config='));
    const configPath = configPathArg
      ? configPathArg.split('=')[1]
      : path.join(process.cwd(), 'team-config.json');

    const dataDir = path.join('data', 'team');
    await fs.mkdir(dataDir, { recursive: true });

    const configRoot = await loadConfig(configPath);

    let allEvents: CalendarEvent[] = [];

    for (const config of configRoot.configs) {
      let groupGames: GameData[] = [];
      for (const team of config.teams) {
        const games = await fetchAllGamesForTeam(team);
        groupGames = [...groupGames, ...games];
      }

      const sourceEvents = transformToSourceData(groupGames);
      const enhancedEvents = enhanceSourceEvents(sourceEvents);
      const finalEvents = finalizeEvents(enhancedEvents);

      const baseFilename = path.basename(config.outputFile, '.ics');
      const jsonFilePath = path.join(dataDir, `${baseFilename}.json`);
      await saveEventsToJson(finalEvents, jsonFilePath);
      console.log(`Team data saved to ${jsonFilePath} with ${finalEvents.length} events`);

      allEvents = [...allEvents, ...finalEvents];
    }

    if (allEvents.length > 0) {
      const allTeamsPath = path.join(dataDir, 'all-teams.json');
      await saveEventsToJson(allEvents, allTeamsPath);
      console.log(`Saved ${allEvents.length} events from all teams to ${allTeamsPath}`);
    }
  } catch (error) {
    console.error('Error processing team data:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export {
  fetchAllGamesForTeam,
  parseGamesFromHTML,
  transformToSourceData,
  enhanceSourceEvents,
  type GameData,
};

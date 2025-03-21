import { writeFile, readFile } from 'fs/promises';
import { JSDOM } from 'jsdom';
import { createEvents, EventAttributes } from 'ics';
import * as path from 'path';

interface TeamConfig {
  teamId: number;
  teamName: string;
}

interface ConfigGroup {
  teams: TeamConfig[];
  outputFile: string;
}

// Changed from AppConfig to ConfigRoot
interface ConfigRoot {
  configs: ConfigGroup[];
}

// Add missing interfaces
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

// Default config now contains an array of configs
const DEFAULT_CONFIG: ConfigRoot = {
  configs: [
    {
      teams: [
        { teamId: 354611, teamName: "IFK Aspudden-Tellus Blå 1" }
      ],
      outputFile: "team-calendar.ics"
    }
  ]
};

async function loadConfig(configPath: string = './team-config.json'): Promise<ConfigRoot> {
  try {
    const configData = await readFile(configPath, 'utf8');
    const jsonData = JSON.parse(configData);
    
    // Handle both formats: array of configs or object with configs array
    if (Array.isArray(jsonData)) {
      return { configs: jsonData };
    } else if (jsonData.configs && Array.isArray(jsonData.configs)) {
      return jsonData as ConfigRoot;
    } else {
      // Handle legacy format (single config)
      return { 
        configs: [jsonData as ConfigGroup]
      };
    }
  } catch (error) {
    console.warn(`Could not load config from ${configPath}, using default config:`, error);
    return DEFAULT_CONFIG;
  }
}

async function fetchGamesPage(teamId: number, from: number = 0): Promise<TeamResponse> {
  const requestUrl = `https://www.stff.se/api/team/upcoming-games/?teamId=${teamId}${from ? `&from=${from}` : ''}`;
  console.log(`Fetching ${requestUrl}`);
  
  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

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
    
    const homeTeamElement = item.querySelector('.match-link__column--flags .team-logo:first-child img');
    const homeTeam = homeTeamElement?.getAttribute('alt')?.replace(' emblem', '') || '';
    
    const awayTeamElement = item.querySelector('.match-link__column--flags .team-logo:last-child img');
    const awayTeam = awayTeamElement?.getAttribute('alt')?.replace(' emblem', '') || '';
    
    const categoryElement = item.querySelector('.match-link__tag');
    const category = categoryElement?.textContent?.trim() || '';
    
    const eventElement = item.querySelector('.match-link__event');
    const location = eventElement ? 
      eventElement.textContent?.trim()?.replace(/\d{2}:\d{2}/, '')?.trim() || '' : '';
    
    games.push({
      id,
      dateTime,
      homeTeam,
      awayTeam,
      category,
      location,
      url: `https://www.stff.se${url}`
    });
  });
  
  return games;
}

function toICSData(games: GameData[]): EventAttributes[] {
  return games.map(game => {
    const dateTime = new Date(game.dateTime);
    const endDateTime = new Date(dateTime.getTime() + 90 * 60000); // 90 minutes games
    
    return {
      uid: `team-game-${game.id}`,
      start: [
        dateTime.getFullYear(),
        dateTime.getMonth() + 1,
        dateTime.getDate(),
        dateTime.getHours(),
        dateTime.getMinutes()
      ] as [number, number, number, number, number],
      end: [
        endDateTime.getFullYear(),
        endDateTime.getMonth() + 1,
        endDateTime.getDate(),
        endDateTime.getHours(),
        endDateTime.getMinutes()
      ] as [number, number, number, number, number],
      title: `${game.homeTeam} vs ${game.awayTeam}`,
      description: game.category,
      location: game.location,
      url: game.url,
      categories: [game.category]
    };
  });
}

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

async function main() {
  // Get config file path from args if provided
  const args = process.argv.slice(2);
  const configPathArg = args.find(arg => arg.startsWith('--config='));
  const configPath = configPathArg 
    ? configPathArg.split('=')[1] 
    : path.join(process.cwd(), 'team-config.json');

  console.log(`Loading config from ${configPath}`);
  const configRoot = await loadConfig(configPath);
  
  for (const config of configRoot.configs) {
    console.log(`Processing configuration for ${config.outputFile}...`);
    console.log(`Fetching games for ${config.teams.length} team(s)`);
    
    let allGames: GameData[] = [];
    
    for (const team of config.teams) {
      console.log(`Processing team: ${team.teamName} (ID: ${team.teamId})`);
      const games = await fetchAllGamesForTeam(team);
      console.log(`Found ${games.length} upcoming games for ${team.teamName}`);
      allGames = [...allGames, ...games];
    }
    
    console.log(`Total games found for this config: ${allGames.length}`);
    
    if (allGames.length > 0) {
      const events = toICSData(allGames);
      
      const { error, value } = createEvents(events);
      if (error) throw error;
      if (!value) throw new Error('No calendar data was generated');
      
      await writeFile(config.outputFile, value);
      console.log(`Calendar saved to ${config.outputFile} with ${events.length} events`);
    } else {
      console.log('No games found, no calendar file was created.');
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { fetchAllGamesForTeam, parseGamesFromHTML, toICSData };

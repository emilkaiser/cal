"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllGamesForTeam = fetchAllGamesForTeam;
exports.parseGamesFromHTML = parseGamesFromHTML;
exports.transformToSourceData = transformToSourceData;
exports.enhanceSourceEvents = enhanceSourceEvents;
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const jsdom_1 = require("jsdom");
const calendar_io_1 = require("./utils/calendar-io");
const team_metadata_1 = require("./utils/team-metadata");
const team_parser_1 = require("./utils/team-parser");
const venue_utils_1 = require("./utils/venue-utils");
const event_formatter_1 = require("./utils/event-formatter");
const match_utils_1 = require("./utils/match-utils");
// 1. Load configuration
function loadConfig() {
    return __awaiter(this, arguments, void 0, function* (configPath = './team-config.json') {
        console.log(`Loading team configuration from ${configPath}`);
        try {
            const configData = yield fs.readFile(configPath, 'utf8');
            const jsonData = JSON.parse(configData);
            if (Array.isArray(jsonData)) {
                return { configs: jsonData };
            }
            else if (jsonData.configs && Array.isArray(jsonData.configs)) {
                return jsonData;
            }
            else {
                return {
                    configs: [jsonData],
                };
            }
        }
        catch (error) {
            console.warn(`Could not load config from ${configPath}`, error);
            return { configs: [] };
        }
    });
}
// Fetch data from external source
function fetchGamesPage(teamId_1) {
    return __awaiter(this, arguments, void 0, function* (teamId, from = 0) {
        const requestUrl = `https://www.stff.se/api/team/upcoming-games/?teamId=${teamId}${from ? `&from=${from}` : ''}`;
        console.log(`Fetching ${requestUrl}`);
        const response = yield fetch(requestUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        return yield response.json();
    });
}
// Extract games from HTML
function parseGamesFromHTML(html) {
    const dom = new jsdom_1.JSDOM(html);
    const document = dom.window.document;
    const matchItems = document.querySelectorAll('.match-board__item');
    const games = [];
    matchItems.forEach((item) => {
        var _a, _b, _c, _d, _e, _f;
        const link = item.querySelector('.match-link__match');
        if (!link)
            return;
        const url = link.getAttribute('href') || '';
        const id = url.split('=')[1] || '';
        const dateTimeElement = item.querySelector('time.match-link__date');
        const dateTime = (dateTimeElement === null || dateTimeElement === void 0 ? void 0 : dateTimeElement.getAttribute('datetime')) || '';
        const homeTeamElement = item.querySelector('.match-link__column--flags .team-logo:first-child img');
        const homeTeam = ((_a = homeTeamElement === null || homeTeamElement === void 0 ? void 0 : homeTeamElement.getAttribute('alt')) === null || _a === void 0 ? void 0 : _a.replace(' emblem', '')) || '';
        const awayTeamElement = item.querySelector('.match-link__column--flags .team-logo:last-child img');
        const awayTeam = ((_b = awayTeamElement === null || awayTeamElement === void 0 ? void 0 : awayTeamElement.getAttribute('alt')) === null || _b === void 0 ? void 0 : _b.replace(' emblem', '')) || '';
        const categoryElement = item.querySelector('.match-link__tag');
        const category = ((_c = categoryElement === null || categoryElement === void 0 ? void 0 : categoryElement.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '';
        const eventElement = item.querySelector('.match-link__event');
        const location = eventElement
            ? ((_f = (_e = (_d = eventElement.textContent) === null || _d === void 0 ? void 0 : _d.trim()) === null || _e === void 0 ? void 0 : _e.replace(/\d{2}:\d{2}/, '')) === null || _f === void 0 ? void 0 : _f.trim()) || ''
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
function transformToSourceData(games) {
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
function enhanceSourceEvents(events) {
    return events.map(event => {
        const game = event.rawData;
        const teamName = game.homeTeam;
        const color = (0, team_metadata_1.getColorFromTeamName)(teamName);
        const gender = (0, team_metadata_1.getGenderFromTeamName)(teamName);
        const ageGroup = (0, team_metadata_1.getAgeGroupFromTeamName)(teamName);
        let formattedTeam;
        if (gender && ageGroup) {
            formattedTeam = (0, team_parser_1.createFormattedTeamName)(gender, ageGroup, color);
        }
        if (!formattedTeam) {
            formattedTeam = teamName;
        }
        const venues = (0, venue_utils_1.extractVenues)(event.location);
        const match = (0, match_utils_1.getHomeAwayCategory)(event);
        const opponent = (0, match_utils_1.getOpponent)(event);
        return Object.assign(Object.assign({}, event), { color,
            gender,
            ageGroup,
            formattedTeam, team: teamName, venues,
            match,
            opponent, activity: 'Match', formattedTitle: (0, event_formatter_1.formatEventTitle)(formattedTeam, event.title, 'Match', match, opponent, game.homeTeam, game.awayTeam) });
    });
}
// Remove temporary properties if any (for consistency with other scrapers)
function finalizeEvents(events) {
    return events.map(event => {
        const e = Object.assign({}, event);
        delete e.rawTeam;
        return e;
    });
}
// Fetch all games for a team
function fetchAllGamesForTeam(team) {
    return __awaiter(this, void 0, void 0, function* () {
        let allGames = [];
        let nextUrl = null;
        let from = 0;
        do {
            const response = yield fetchGamesPage(team.teamId, from);
            const games = parseGamesFromHTML(response.data);
            allGames = [...allGames, ...games];
            nextUrl = response.nextUrl;
            if (nextUrl) {
                const match = nextUrl.match(/from=(\d+)/);
                from = match ? parseInt(match[1]) : 0;
            }
        } while (nextUrl);
        return allGames;
    });
}
// 4. Main process
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const args = process.argv.slice(2);
            const configPathArg = args.find(arg => arg.startsWith('--config='));
            const configPath = configPathArg
                ? configPathArg.split('=')[1]
                : path.join(process.cwd(), 'team-config.json');
            const dataDir = path.join('data', 'team');
            yield fs.mkdir(dataDir, { recursive: true });
            const configRoot = yield loadConfig(configPath);
            let allEvents = [];
            for (const config of configRoot.configs) {
                let groupGames = [];
                for (const team of config.teams) {
                    const games = yield fetchAllGamesForTeam(team);
                    groupGames = [...groupGames, ...games];
                }
                const sourceEvents = transformToSourceData(groupGames);
                const enhancedEvents = enhanceSourceEvents(sourceEvents);
                const finalEvents = finalizeEvents(enhancedEvents);
                const baseFilename = path.basename(config.outputFile, '.ics');
                const jsonFilePath = path.join(dataDir, `${baseFilename}.json`);
                yield (0, calendar_io_1.saveEventsToJson)(finalEvents, jsonFilePath);
                console.log(`Team data saved to ${jsonFilePath} with ${finalEvents.length} events`);
                allEvents = [...allEvents, ...finalEvents];
            }
            if (allEvents.length > 0) {
                const allTeamsPath = path.join(dataDir, 'all-teams.json');
                yield (0, calendar_io_1.saveEventsToJson)(allEvents, allTeamsPath);
                console.log(`Saved ${allEvents.length} events from all teams to ${allTeamsPath}`);
            }
        }
        catch (error) {
            console.error('Error processing team data:', error);
        }
    });
}
if (require.main === module) {
    main().catch(console.error);
}

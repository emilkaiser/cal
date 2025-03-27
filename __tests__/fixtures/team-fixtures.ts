// import { GameData } from '../../src/scrapers/team-scraper';
// import { EventSourceData } from '../../src/utils/event-normalizer';
// import { CalendarEvent } from '../../src/utils/ics-converter';

// // Sample team API response data
// export const teamGamesHTML = `
// <div class="match-board">
//   <div class="match-board__item">
//     <a class="match-link__match" href="/match?matchId=1001">
//       <time class="match-link__date" datetime="2023-09-15T19:00:00+02:00">15 sep 19:00</time>
//       <div class="match-link__column--flags">
//         <div class="team-logo"><img alt="IFK Aspudden-Tellus emblem" src="/emblem1.jpg"></div>
//         <div class="team-logo"><img alt="Enskede IK emblem" src="/emblem2.jpg"></div>
//       </div>
//       <div class="match-link__tag">Division 4A Herrar</div>
//       <div class="match-link__event">19:00 Aspuddens IP 1</div>
//     </a>
//   </div>
//   <div class="match-board__item">
//     <a class="match-link__match" href="/match?matchId=1004">
//       <time class="match-link__date" datetime="2023-09-20T19:30:00+02:00">20 sep 19:30</time>
//       <div class="match-link__column--flags">
//         <div class="team-logo"><img alt="Årsta FF emblem" src="/emblem3.jpg"></div>
//         <div class="team-logo"><img alt="IFK Aspudden-Tellus emblem" src="/emblem1.jpg"></div>
//       </div>
//       <div class="match-link__tag">Division 4A Herrar</div>
//       <div class="match-link__event">19:30 Årsta IP</div>
//     </a>
//   </div>
// </div>`;

// // Parsed games from HTML
// export const teamGamesRaw: GameData[] = [
//   {
//     id: '1001',
//     dateTime: '2023-09-15T19:00:00+02:00',
//     homeTeam: 'IFK Aspudden-Tellus',
//     awayTeam: 'Enskede IK',
//     category: 'Division 4A Herrar',
//     location: 'Aspuddens IP 1',
//     url: 'https://www.stff.se/match?matchId=1001',
//   },
//   {
//     id: '1004',
//     dateTime: '2023-09-20T19:30:00+02:00',
//     homeTeam: 'Årsta FF',
//     awayTeam: 'IFK Aspudden-Tellus',
//     category: 'Division 4A Herrar',
//     location: 'Årsta IP',
//     url: 'https://www.stff.se/match?matchId=1004',
//   },
// ];

// // Expected transformed source data from team games
// export const teamSourceEvents: EventSourceData[] = [
//   {
//     uid: 'team-game-1001',
//     title: 'IFK Aspudden-Tellus vs Enskede IK',
//     start: new Date('2023-09-15T17:00:00.000Z'),
//     end: new Date('2023-09-15T18:30:00.000Z'),
//     description: 'Division 4A Herrar',
//     location: 'Aspuddens IP 1',
//     url: 'https://www.stff.se/match?matchId=1001',
//     categories: ['Division 4A Herrar'],
//     sourceType: 'team',
//     rawData: teamGamesRaw[0],
//   },
//   {
//     uid: 'team-game-1004',
//     title: 'Årsta FF vs IFK Aspudden-Tellus',
//     start: new Date('2023-09-20T17:30:00.000Z'),
//     end: new Date('2023-09-20T19:00:00.000Z'),
//     description: 'Division 4A Herrar',
//     location: 'Årsta IP',
//     url: 'https://www.stff.se/match?matchId=1004',
//     categories: ['Division 4A Herrar'],
//     sourceType: 'team',
//     rawData: teamGamesRaw[1],
//   },
// ];

// // Expected normalized events after processing
// export const teamNormalizedEvents: CalendarEvent[] = [
//   {
//     uid: 'team-game-1001',
//     title: 'IFK Aspudden-Tellus vs Enskede IK',
//     start: new Date('2023-09-15T17:00:00.000Z'),
//     end: new Date('2023-09-15T18:30:00.000Z'),
//     description: 'Division 4A Herrar',
//     location: 'Aspuddens IP 1',
//     url: 'https://www.stff.se/match?matchId=1001',
//     categories: ['Division 4A Herrar', 'Home', 'Aspuddens IP', 'Aspuddens IP 1'],
//     activity: 'Match',
//     gender: 'male',
//     homeTeam: 'IFK Aspudden-Tellus',
//     awayTeam: 'Enskede IK',
//     match: 'home',
//     normalizedVenue: ['Aspuddens IP', 'Aspuddens IP 1'],
//   },
//   {
//     uid: 'team-game-1004',
//     title: 'Årsta FF vs IFK Aspudden-Tellus',
//     start: new Date('2023-09-20T17:30:00.000Z'),
//     end: new Date('2023-09-20T19:00:00.000Z'),
//     description: 'Division 4A Herrar',
//     location: 'Årsta IP',
//     url: 'https://www.stff.se/match?matchId=1004',
//     categories: ['Division 4A Herrar', 'Away'],
//     activity: 'Match',
//     gender: 'male',
//     homeTeam: 'Årsta FF',
//     awayTeam: 'IFK Aspudden-Tellus',
//     match: 'away',
//     normalizedVenue: [],
//   },
// ];

// // Fixture tuples for easier testing - [input, expected output]
// export const parseTeamHTMLTestData: [string, GameData[]] = [teamGamesHTML, teamGamesRaw];

// export const transformTeamTestData: [GameData[], EventSourceData[]] = [
//   teamGamesRaw,
//   teamSourceEvents,
// ];

// export const enhanceTeamTestData: [EventSourceData[], EventSourceData[]] = [
//   teamSourceEvents,
//   teamSourceEvents,
// ];

// export const normalizeTeamTestData: [EventSourceData[], CalendarEvent[]] = [
//   teamSourceEvents,
//   teamNormalizedEvents,
// ];

// // E2E pipeline test data - HTML to final normalized events
// export const teamE2ETestData: [string, CalendarEvent[]] = [teamGamesHTML, teamNormalizedEvents];

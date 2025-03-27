// import { transformToSourceData, enhanceSourceEvents } from '../../src/scrapers/team-scraper';
// import { normalizeEvents } from '../../src/utils/event-normalizer';
// import { parseGamesFromHTML } from '../../src/scrapers/team-scraper';
// import {
//   teamGamesHTML,
//   teamGamesRaw,
//   teamSourceEvents,
//   teamNormalizedEvents,
// } from '../fixtures/team-fixtures';

// describe('Team Scraper', () => {
//   describe('parseGamesFromHTML', () => {
//     it('should extract games from HTML', () => {
//       const result = parseGamesFromHTML(teamGamesHTML);

//       expect(result).toHaveLength(2);

//       // Check first game details
//       expect(result[0].id).toBe('1001');
//       expect(result[0].homeTeam).toBe('IFK Aspudden-Tellus');
//       expect(result[0].awayTeam).toBe('Enskede IK');
//       expect(result[0].dateTime).toBe('2023-09-15T19:00:00+02:00');
//       expect(result[0].location).toBe('Aspuddens IP 1');
//       expect(result[0].category).toBe('Division 4A Herrar');

//       // Check second game - away game
//       expect(result[1].homeTeam).toBe('Årsta FF');
//       expect(result[1].awayTeam).toBe('IFK Aspudden-Tellus');
//     });

//     it('should handle empty HTML', () => {
//       const result = parseGamesFromHTML('');
//       expect(result).toEqual([]);
//     });
//   });

//   describe('transformToSourceData', () => {
//     it('should transform games into source events', () => {
//       const result = transformToSourceData(teamGamesRaw);

//       expect(result).toHaveLength(teamGamesRaw.length);

//       // Check first event
//       expect(result[0].uid).toBe('team-game-1001');
//       expect(result[0].title).toBe('IFK Aspudden-Tellus vs Enskede IK');
//       expect(result[0].start).toEqual(new Date('2023-09-15T17:00:00.000Z'));
//       expect(result[0].end).toEqual(new Date('2023-09-15T18:30:00.000Z'));
//       expect(result[0].sourceType).toBe('team');

//       // Check away game
//       expect(result[1].title).toBe('Årsta FF vs IFK Aspudden-Tellus');
//       expect(result[1].location).toBe('Årsta IP');
//     });
//   });

//   describe('enhanceSourceEvents', () => {
//     it('should enhance source events with team-specific information', () => {
//       const result = enhanceSourceEvents(teamSourceEvents);

//       // Our implementation doesn't add much team-specific info yet,
//       // but we verify structure is maintained
//       expect(result).toHaveLength(teamSourceEvents.length);
//       expect(result[0].uid).toBe(teamSourceEvents[0].uid);
//       expect(result[0].title).toBe(teamSourceEvents[0].title);
//     });
//   });

//   describe('End-to-end processing', () => {
//     it('should process team games through the entire pipeline', () => {
//       // Extract games from HTML
//       const games = parseGamesFromHTML(teamGamesHTML);

//       // Transform to source events
//       const sourceEvents = transformToSourceData(games);

//       // Apply team-specific enhancements
//       const enhancedSourceEvents = enhanceSourceEvents(sourceEvents);

//       // Apply common normalization
//       const normalizedEvents = normalizeEvents(enhancedSourceEvents);

//       // Verify results
//       expect(normalizedEvents).toHaveLength(2);

//       // Check home game
//       const homeGame = normalizedEvents[0];
//       expect(homeGame.title).toBe('IFK Aspudden-Tellus vs Enskede IK');
//       expect(homeGame.match).toBe('home');
//       expect(homeGame.categories).toContain('Home');

//       // Check away game
//       const awayGame = normalizedEvents[1];
//       expect(awayGame.title).toBe('Årsta FF vs IFK Aspudden-Tellus');
//       expect(awayGame.match).toBe('away');
//       expect(awayGame.categories).toContain('Away');
//     });
//   });
// });

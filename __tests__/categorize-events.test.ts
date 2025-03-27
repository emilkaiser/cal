// import {
//   getHomeAwayCategory,
//   getEventType,
//   formatEventTitle,
//   enhanceEvent,
//   EVENT_TYPES,
// } from '../src/utils/categorize-events';
// import { CalendarEvent } from '../src/utils/ics-converter';

// // Mock location-utils functions that categorize-events depends on
// jest.mock('../src/utils/location-utils', () => ({
//   isHomeVenue: (location: string) =>
//     location.includes('Aspuddens') || location.includes('Västberga'),
//   normalizeLocation: (location: string) => (location ? location.toLowerCase() : null),
//   getVenues: (location: string) => {
//     const categories: string[] = [];
//     if (location.includes('Aspuddens')) {
//       categories.push('Aspuddens IP');
//       if (location.includes('1')) categories.push('Aspuddens IP 1');
//       if (location.includes('2')) categories.push('Aspuddens IP 2');
//     }
//     if (location.includes('Västberga')) {
//       categories.push('Västberga IP');
//       if (location.includes('1')) categories.push('Västberga IP 1');
//     }
//     return categories;
//   },
// }));

// describe('getHomeAwayCategory', () => {
//   it('should identify home games based on venue', () => {
//     const event: CalendarEvent = {
//       title: 'Some Match',
//       start: new Date(),
//       end: new Date(),
//       location: 'Aspuddens IP',
//     };

//     expect(getHomeAwayCategory(event)).toBe('Home');
//   });

//   it('should identify away games based on venue', () => {
//     const event: CalendarEvent = {
//       title: 'Some Match',
//       start: new Date(),
//       end: new Date(),
//       location: 'Another Team IP',
//     };

//     expect(getHomeAwayCategory(event)).toBe('Away');
//   });

//   it('should identify home games based on team names in title with vs pattern', () => {
//     const event: CalendarEvent = {
//       title: 'IFK Aspudden-Tellus vs Other Team',
//       start: new Date(),
//       end: new Date(),
//     };

//     expect(getHomeAwayCategory(event)).toBe('Home');
//   });

//   it('should identify away games based on team names in title with vs pattern', () => {
//     const event: CalendarEvent = {
//       title: 'Other Team vs IFK Aspudden-Tellus',
//       start: new Date(),
//       end: new Date(),
//     };

//     expect(getHomeAwayCategory(event)).toBe('Away');
//   });
// });

// describe('getEventType', () => {
//   it('should detect match events from title containing vs', () => {
//     const event: CalendarEvent = {
//       title: 'Team A vs Team B',
//       start: new Date(),
//       end: new Date(),
//     };

//     expect(getEventType(event)).toBe(EVENT_TYPES.MATCH);
//   });

//   it('should detect training events from title', () => {
//     const event: CalendarEvent = {
//       title: 'Team A - Träning',
//       start: new Date(),
//       end: new Date(),
//     };

//     expect(getEventType(event)).toBe(EVENT_TYPES.TRAINING);
//   });

//   it('should detect cup events from title', () => {
//     const event: CalendarEvent = {
//       title: 'Team A - Summer Cup',
//       start: new Date(),
//       end: new Date(),
//     };

//     expect(getEventType(event)).toBe(EVENT_TYPES.CUP);
//   });

//   it('should use categories if provided', () => {
//     const event: CalendarEvent = {
//       title: 'Some Event',
//       start: new Date(),
//       end: new Date(),
//       categories: ['Träning'],
//     };

//     expect(getEventType(event)).toBe(EVENT_TYPES.TRAINING);
//   });
// });

// describe('formatEventTitle', () => {
//   it('should format training event titles', () => {
//     const title = 'A-lag Herrar - Träning';
//     const eventType = EVENT_TYPES.TRAINING;
//     const teamName = 'IFK AT';

//     expect(formatEventTitle(title, eventType, teamName)).toBe('IFK AT - Träning');
//   });

//   it('should format match event titles', () => {
//     const title = 'A-lag Herrar - Hammarby IF';
//     const eventType = EVENT_TYPES.MATCH;
//     const teamName = 'IFK AT';

//     expect(formatEventTitle(title, eventType, teamName)).toBe('IFK AT vs Hammarby IF');
//   });

//   it('should handle events with no type', () => {
//     const title = 'Some Random Event';
//     const eventType = undefined;
//     const teamName = 'IFK AT';

//     expect(formatEventTitle(title, eventType, teamName)).toBe('IFK AT - Some Random Event');
//   });
// });

// describe('enhanceEvent', () => {
//   it('should properly enhance a training event', () => {
//     const event: CalendarEvent = {
//       title: 'P2010 Röd - Träning',
//       start: new Date('2025-02-11T17:45:00.000Z'),
//       end: new Date('2025-02-11T19:30:00.000Z'),
//       description: 'Träning på Västberga',
//       location: 'Västberga IP',
//     };

//     const enhanced = enhanceEvent(event);

//     expect(enhanced.activity).toBe(EVENT_TYPES.TRAINING);
//     expect(enhanced.gender).toBe('male');
//     expect(enhanced.normalizedTeam).toBe('p2010 röd');
//     expect(enhanced.homeTeam).toBeUndefined();
//     expect(enhanced.awayTeam).toBeUndefined();
//     expect(enhanced.match).toBeUndefined();
//     expect(enhanced.normalizedVenue).toEqual(['Västberga IP']);
//   });

//   it('should properly enhance a match event', () => {
//     const event: CalendarEvent = {
//       title: 'P2011 Gul vs Hammarby IF FF 30 vit',
//       start: new Date('2025-06-07T12:00:00.000Z'),
//       end: new Date('2025-06-07T14:00:00.000Z'),
//       description: 'Match info',
//       location: 'Västberga IP 1',
//     };

//     const enhanced = enhanceEvent(event);

//     expect(enhanced.activity).toBe(EVENT_TYPES.MATCH);
//     expect(enhanced.gender).toBe('male');
//     expect(enhanced.normalizedTeam).toBe('p2011 gul');
//     expect(enhanced.homeTeam).toBe('P2011 Gul');
//     expect(enhanced.awayTeam).toBe('Hammarby IF FF 30 vit');
//     expect(enhanced.match).toBe('home');
//     expect(enhanced.normalizedVenue).toEqual(['Västberga IP', 'Västberga IP 1']);
//   });

//   it('should extract match info from description when needed', () => {
//     const event: CalendarEvent = {
//       title: 'A-lag Herrar - Match',
//       start: new Date(),
//       end: new Date(),
//       description: 'Match mot Enskede FK',
//       location: 'Another Team IP',
//     };

//     const enhanced = enhanceEvent(event);

//     expect(enhanced.activity).toBe(EVENT_TYPES.MATCH);
//     expect(enhanced.gender).toBe('male');
//     expect(enhanced.awayTeam).toBe('Enskede FK');
//     expect(enhanced.match).toBe('away');
//   });

//   it('should extract age group from title', () => {
//     const event: CalendarEvent = {
//       title: 'F15 - Träning',
//       start: new Date(),
//       end: new Date(),
//     };

//     const enhanced = enhanceEvent(event);

//     expect(enhanced.ageGroup).toBe('F15');
//     expect(enhanced.gender).toBe('female');
//   });

//   it('should extract birth year as age group', () => {
//     const event: CalendarEvent = {
//       title: 'P2010 - Träning',
//       start: new Date(),
//       end: new Date(),
//     };

//     const enhanced = enhanceEvent(event);

//     expect(enhanced.ageGroup).toBe('2010');
//     expect(enhanced.gender).toBe('male');
//   });
// });

// describe('extractTeamName and match detection', () => {
//   it('should correctly extract team name from complex titles', () => {
//     const events: { title: string; expectedTeam: string; expectedType: string }[] = [
//       {
//         title: 'P2010 Röd vs Hammarby IF',
//         expectedTeam: 'P2010 Röd',
//         expectedType: EVENT_TYPES.MATCH,
//       },
//       {
//         title: 'F15 Intresseanmälan Gothia Cup',
//         expectedTeam: 'F15',
//         expectedType: undefined,
//       },
//       {
//         title: 'A-lag Herrar - Träning med fika efter',
//         expectedTeam: 'A-lag Herrar',
//         expectedType: EVENT_TYPES.TRAINING,
//       },
//       {
//         title: 'Newbie - Tr️äning', // With a hidden character in the word "Träning"
//         expectedTeam: 'Newbie',
//         expectedType: undefined, // Won't be detected due to the hidden character
//       },
//     ];

//     for (const testCase of events) {
//       const event: CalendarEvent = {
//         title: testCase.title,
//         start: new Date(),
//         end: new Date(),
//       };

//       const enhanced = enhanceEvent(event);
//       expect(enhanced.normalizedTeam?.includes(testCase.expectedTeam.toLowerCase())).toBe(true);
//       expect(enhanced.activity).toBe(testCase.expectedType);
//     }
//   });

//   it('should handle unusual but realistic cases', () => {
//     const event: CalendarEvent = {
//       title: 'Match IFK AT vs Årsta FF - Inställd', // Cancelled match
//       start: new Date(),
//       end: new Date(),
//       location: 'Aspuddens IP 1',
//     };

//     const enhanced = enhanceEvent(event);
//     expect(enhanced.activity).toBe(EVENT_TYPES.MATCH);
//     expect(enhanced.match).toBe('home');
//     expect(enhanced.homeTeam).toContain('IFK AT');
//   });

//   it('should handle matches with no venue specified', () => {
//     const event: CalendarEvent = {
//       title: 'P2011 Gul vs Hammarby IF FF 30 vit',
//       start: new Date('2025-06-07T12:00:00.000Z'),
//       end: new Date('2025-06-07T14:00:00.000Z'),
//       description: 'Match info',
//       // No location provided
//     };

//     const enhanced = enhanceEvent(event);

//     expect(enhanced.activity).toBe(EVENT_TYPES.MATCH);
//     expect(enhanced.gender).toBe('male');
//     expect(enhanced.homeTeam).toBe('P2011 Gul');
//     expect(enhanced.awayTeam).toBe('Hammarby IF FF 30 vit');
//     // No match property set as we can't determine home/away without location
//     expect(enhanced.match).toBeUndefined();
//   });
// });

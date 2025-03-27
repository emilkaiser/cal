// import { ICalEvent } from '../../src/scrapers/laget-scraper';
// import { EventSourceData } from '../../src/utils/event-normalizer';
// import { CalendarEvent } from '../../src/utils/ics-converter';

// // Group fixtures into an array of objects for better organization
// export const lagetFixtures = [
//   // Event 1 - Away match (Hammarby vs Aspudden)
//   {
//     raw: {
//       '27269587@laget.se': {
//         type: 'VEVENT',
//         params: [],
//         categories: ['Match'],
//         description:
//           'Samlingstid\n2025-02-01 15:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379049',
//         end: new Date('2025-02-01T17:00:00.000Z'),
//         dtstamp: new Date('2025-03-26T09:01:11.000Z'),
//         start: new Date('2025-02-01T15:00:00.000Z'),
//         datetype: 'date-time',
//         location: 'Eriksdalshallen Lilla',
//         priority: '5',
//         sequence: '0',
//         status: 'CONFIRMED',
//         summary: 'Match Hammarby IF FF 20 - IFK Aspudden-Tellus Röd 1',
//         transparency: 'OPAQUE',
//         uid: '27269587@laget.se',
//         method: 'PUBLISH',
//       },
//     },
//     processed: {
//       type: 'VEVENT',
//       uid: '27269587@laget.se',
//       summary: 'Match Hammarby IF FF 20 - IFK Aspudden-Tellus Röd 1',
//       start: new Date('2025-02-01T15:00:00.000Z'),
//       end: new Date('2025-02-01T17:00:00.000Z'),
//       description:
//         'Samlingstid\n2025-02-01 15:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379049',
//       location: 'Eriksdalshallen Lilla',
//       categories: ['Match'],
//     },
//     source: {
//       uid: '27269587@laget.se',
//       title: 'Match Hammarby IF FF 20 - IFK Aspudden-Tellus Röd 1',
//       start: new Date('2025-02-01T15:00:00.000Z'),
//       end: new Date('2025-02-01T17:00:00.000Z'),
//       description:
//         'Samlingstid\n2025-02-01 15:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379049',
//       location: 'Eriksdalshallen Lilla',
//       categories: ['Match'],
//       sourceType: 'laget' as const, // Fixed: Add 'as const' to match the union type
//       sourceTeamName: 'IFK Aspudden-Tellus Röd 1',
//       rawData: {}, // In real usage this would contain the processed event
//     },
//     normalized: {
//       uid: '27269587@laget.se',
//       title: 'IFK Aspudden-Tellus Röd 1 vs Hammarby IF FF 20',
//       start: new Date('2025-02-01T15:00:00.000Z'),
//       end: new Date('2025-02-01T17:00:00.000Z'),
//       description:
//         'Samlingstid\n2025-02-01 15:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379049',
//       location: 'Eriksdalshallen Lilla',
//       categories: ['Match', 'Away'],
//       activity: 'Match',
//       gender: 'male' as const, // Fixed: Use 'as const' to match the union type
//       ageGroup: '2014',
//       awayTeam: 'IFK Aspudden-Tellus Röd 1',
//       homeTeam: 'Hammarby IF FF 20',
//       match: 'away',
//       normalizedVenue: [],
//       color: '#2196F3', // Away match color
//     },
//   },

//   // Event 2 - Away match (FC Järfälla vs Aspudden)
//   {
//     raw: {
//       '27269655@laget.se': {
//         type: 'VEVENT',
//         params: [],
//         categories: ['Match'],
//         description:
//           'Samlingstid\n2025-02-02 13:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544973/11379333',
//         end: new Date('2025-02-02T15:00:00.000Z'),
//         dtstamp: new Date('2025-03-26T09:01:11.000Z'),
//         start: new Date('2025-02-02T13:00:00.000Z'),
//         datetype: 'date-time',
//         geo: { lat: 59.455144, lon: 17.813389 },
//         location: 'Kallhälls Sporthall',
//         priority: '5',
//         sequence: '0',
//         status: 'CONFIRMED',
//         summary: 'Match FC Järfälla 2 - IFK Aspudden-Tellus Röd 2',
//         transparency: 'OPAQUE',
//         uid: '27269655@laget.se',
//         method: 'PUBLISH',
//       },
//     },
//     processed: {
//       type: 'VEVENT',
//       uid: '27269655@laget.se',
//       summary: 'Match FC Järfälla 2 - IFK Aspudden-Tellus Röd 2',
//       start: new Date('2025-02-02T13:00:00.000Z'),
//       end: new Date('2025-02-02T15:00:00.000Z'),
//       description:
//         'Samlingstid\n2025-02-02 13:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544973/11379333',
//       location: 'Kallhälls Sporthall',
//       categories: ['Match'],
//       geo: { lat: 59.455144, lon: 17.813389 },
//     },
//     source: {
//       uid: '27269655@laget.se',
//       title: 'Match FC Järfälla 2 - IFK Aspudden-Tellus Röd 2',
//       start: new Date('2025-02-02T13:00:00.000Z'),
//       end: new Date('2025-02-02T15:00:00.000Z'),
//       description:
//         'Samlingstid\n2025-02-02 13:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544973/11379333',
//       location: 'Kallhälls Sporthall',
//       categories: ['Match'],
//       sourceType: 'laget' as const,
//       sourceTeamName: 'IFK Aspudden-Tellus Röd 2',
//       rawData: {}, // In real usage this would contain the processed event
//     },
//     normalized: {
//       uid: '27269655@laget.se',
//       title: 'IFK Aspudden-Tellus Röd 2 vs FC Järfälla 2',
//       start: new Date('2025-02-02T13:00:00.000Z'),
//       end: new Date('2025-02-02T15:00:00.000Z'),
//       description:
//         'Samlingstid\n2025-02-02 13:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544973/11379333',
//       location: 'Kallhälls Sporthall',
//       categories: ['Match', 'Away'],
//       activity: 'Match',
//       gender: 'male' as const,
//       ageGroup: '2014',
//       awayTeam: 'IFK Aspudden-Tellus Röd 2',
//       homeTeam: 'FC Järfälla 2',
//       match: 'away',
//       normalizedVenue: [],
//       color: '#2196F3', // Away match color
//     },
//   },

//   // Event 3 - Training (Blue team)
//   {
//     raw: {
//       '27624278@laget.se': {
//         type: 'VEVENT',
//         params: [],
//         categories: ['Träning'],
//         description: 'Samlingstid\n2025-02-03 18:15',
//         end: new Date('2025-02-03T18:30:00.000Z'),
//         dtstamp: new Date('2025-03-26T09:01:11.000Z'),
//         start: new Date('2025-02-03T17:30:00.000Z'),
//         datetype: 'date-time',
//         geo: { lat: 59.309388, lon: 17.996511 },
//         location: 'Aspuddens Skola (Mellansalen)',
//         priority: '3',
//         sequence: '0',
//         status: 'CONFIRMED',
//         summary: 'Träning - IFK Aspudden-Tellus P2014 Blå',
//         transparency: 'OPAQUE',
//         uid: '27624278@laget.se',
//         method: 'PUBLISH',
//       },
//     },
//     processed: {
//       type: 'VEVENT',
//       uid: '27624278@laget.se',
//       summary: 'Träning - IFK Aspudden-Tellus P2014 Blå',
//       start: new Date('2025-02-03T17:30:00.000Z'),
//       end: new Date('2025-02-03T18:30:00.000Z'),
//       description: 'Samlingstid\n2025-02-03 18:15',
//       location: 'Aspuddens Skola (Mellansalen)',
//       categories: ['Träning'],
//       geo: { lat: 59.309388, lon: 17.996511 },
//     },
//     source: {
//       uid: '27624278@laget.se',
//       title: 'Träning - IFK Aspudden-Tellus P2014 Blå',
//       start: new Date('2025-02-03T17:30:00.000Z'),
//       end: new Date('2025-02-03T18:30:00.000Z'),
//       description: 'Samlingstid\n2025-02-03 18:15',
//       location: 'Aspuddens Skola (Mellansalen)',
//       categories: ['Träning'],
//       sourceType: 'laget' as const,
//       sourceTeamName: 'IFK Aspudden-Tellus P2014 Blå',
//       rawData: {}, // In real usage this would contain the processed event
//     },
//     normalized: {
//       uid: '27624278@laget.se',
//       title: 'IFK Aspudden-Tellus P2014 Blå - Träning',
//       start: new Date('2025-02-03T17:30:00.000Z'),
//       end: new Date('2025-02-03T18:30:00.000Z'),
//       description: 'Samlingstid\n2025-02-03 18:15',
//       location: 'Aspuddens Skola (Mellansalen)',
//       categories: ['Träning', 'Aspuddens Skola', 'Mellansalen'],
//       activity: 'Träning',
//       gender: 'male' as const,
//       ageGroup: '2014',
//       normalizedTeam: 'ifk aspudden-tellus p2014 blå',
//       normalizedVenue: ['Aspuddens Skola', 'Mellansalen'],
//       color: '#1976d2', // Blue team color for P2014 Blå
//     },
//   },

//   // Event 4 - Home match (Aspudden vs Djurgården)
//   {
//     raw: {
//       '27269588@laget.se': {
//         type: 'VEVENT',
//         params: [],
//         categories: ['Match'],
//         description:
//           'Samlingstid\n2025-02-09 08:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379073',
//         end: new Date('2025-02-09T10:00:00.000Z'),
//         dtstamp: new Date('2025-03-26T09:01:11.000Z'),
//         start: new Date('2025-02-09T08:00:00.000Z'),
//         datetype: 'date-time',
//         geo: { lat: 59.292712, lon: 17.976926 },
//         location: 'Västertorpshallen',
//         priority: '5',
//         sequence: '0',
//         status: 'CONFIRMED',
//         summary: 'Match IFK Aspudden-Tellus Röd 1 - Djurgårdens IF FF 3',
//         transparency: 'OPAQUE',
//         uid: '27269588@laget.se',
//         method: 'PUBLISH',
//       },
//     },
//     processed: {
//       type: 'VEVENT',
//       uid: '27269588@laget.se',
//       summary: 'Match IFK Aspudden-Tellus Röd 1 - Djurgårdens IF FF 3',
//       start: new Date('2025-02-09T08:00:00.000Z'),
//       end: new Date('2025-02-09T10:00:00.000Z'),
//       description:
//         'Samlingstid\n2025-02-09 08:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379073',
//       location: 'Västertorpshallen',
//       categories: ['Match'],
//       geo: { lat: 59.292712, lon: 17.976926 },
//     },
//     source: {
//       uid: '27269588@laget.se',
//       title: 'Match IFK Aspudden-Tellus Röd 1 - Djurgårdens IF FF 3',
//       start: new Date('2025-02-09T08:00:00.000Z'),
//       end: new Date('2025-02-09T10:00:00.000Z'),
//       description:
//         'Samlingstid\n2025-02-09 08:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379073',
//       location: 'Västertorpshallen',
//       categories: ['Match'],
//       sourceType: 'laget' as const,
//       sourceTeamName: 'IFK Aspudden-Tellus Röd 1',
//       rawData: {}, // In real usage this would contain the processed event
//     },
//     normalized: {
//       uid: '27269588@laget.se',
//       title: 'IFK Aspudden-Tellus Röd 1 vs Djurgårdens IF FF 3',
//       start: new Date('2025-02-09T08:00:00.000Z'),
//       end: new Date('2025-02-09T10:00:00.000Z'),
//       description:
//         'Samlingstid\n2025-02-09 08:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379073',
//       location: 'Västertorpshallen',
//       categories: ['Match', 'Home', 'Västertorpshallen'],
//       activity: 'Match',
//       gender: 'male' as const,
//       ageGroup: '2014',
//       homeTeam: 'IFK Aspudden-Tellus Röd 1',
//       awayTeam: 'Djurgårdens IF FF 3',
//       match: 'home',
//       normalizedVenue: ['Västertorpshallen'],
//       color: '#4CAF50', // Home match color
//     },
//   },

//   // Event 5 - Home match (Aspudden vs Viggbyholm)
//   {
//     raw: {
//       '27269656@laget.se': {
//         type: 'VEVENT',
//         params: [],
//         categories: ['Match'],
//         description:
//           'Samlingstid\n2025-02-09 16:00\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544973/11379329',
//         end: new Date('2025-02-09T17:30:00.000Z'),
//         dtstamp: new Date('2025-03-26T09:01:11.000Z'),
//         start: new Date('2025-02-09T15:30:00.000Z'),
//         datetype: 'date-time',
//         geo: { lat: 59.30382, lon: 18.018371 },
//         location: 'Tellusborgshallarna',
//         priority: '5',
//         sequence: '0',
//         status: 'CONFIRMED',
//         summary: 'Match IFK Aspudden-Tellus Röd 2 - Viggbyholms IK FF Röd',
//         transparency: 'OPAQUE',
//         uid: '27269656@laget.se',
//         method: 'PUBLISH',
//       },
//     },
//     processed: {
//       type: 'VEVENT',
//       uid: '27269656@laget.se',
//       summary: 'Match IFK Aspudden-Tellus Röd 2 - Viggbyholms IK FF Röd',
//       start: new Date('2025-02-09T15:30:00.000Z'),
//       end: new Date('2025-02-09T17:30:00.000Z'),
//       description:
//         'Samlingstid\n2025-02-09 16:00\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544973/11379329',
//       location: 'Tellusborgshallarna',
//       categories: ['Match'],
//       geo: { lat: 59.30382, lon: 18.018371 },
//     },
//     source: {
//       uid: '27269656@laget.se',
//       title: 'Match IFK Aspudden-Tellus Röd 2 - Viggbyholms IK FF Röd',
//       start: new Date('2025-02-09T15:30:00.000Z'),
//       end: new Date('2025-02-09T17:30:00.000Z'),
//       description:
//         'Samlingstid\n2025-02-09 16:00\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544973/11379329',
//       location: 'Tellusborgshallarna',
//       categories: ['Match'],
//       sourceType: 'laget' as const,
//       sourceTeamName: 'IFK Aspudden-Tellus Röd 2',
//       rawData: {}, // In real usage this would contain the processed event
//     },
//     normalized: {
//       uid: '27269656@laget.se',
//       title: 'IFK Aspudden-Tellus Röd 2 vs Viggbyholms IK FF Röd',
//       start: new Date('2025-02-09T15:30:00.000Z'),
//       end: new Date('2025-02-09T17:30:00.000Z'),
//       description:
//         'Samlingstid\n2025-02-09 16:00\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544973/11379329',
//       location: 'Tellusborgshallarna',
//       categories: ['Match', 'Home', 'Tellusborgshallarna'],
//       activity: 'Match',
//       gender: 'male' as const,
//       ageGroup: '2014',
//       homeTeam: 'IFK Aspudden-Tellus Röd 2',
//       awayTeam: 'Viggbyholms IK FF Röd',
//       match: 'home',
//       normalizedVenue: ['Tellusborgshallarna'],
//       color: '#4CAF50', // Home match color
//     },
//   },
// ];

// // Helper functions to convert the fixtures to different formats needed for tests
// export const createRawEventsObject = () => {
//   const rawEvents: Record<string, any> = {};
//   lagetFixtures.forEach(fixture => {
//     // Merge all raw events into one object
//     Object.assign(rawEvents, fixture.raw);
//   });
//   return rawEvents;
// };

// export const createProcessedEventsObject = () => {
//   const processedEvents: Record<string, ICalEvent> = {};
//   lagetFixtures.forEach(fixture => {
//     // Get the key from the raw object
//     const key = Object.keys(fixture.raw)[0];
//     processedEvents[key] = fixture.processed;
//   });
//   return processedEvents;
// };

// export const getSourceEvents = (): EventSourceData[] => {
//   return lagetFixtures.map(fixture => fixture.source as EventSourceData);
// };

// export const getNormalizedEvents = (): CalendarEvent[] => {
//   return lagetFixtures.map(fixture => fixture.normalized as CalendarEvent);
// };

// // For backward compatibility and easier migration
// export const lagetRawEvents = createRawEventsObject();
// export const lagetEventsProcessed = createProcessedEventsObject();
// export const lagetSourceEvents = getSourceEvents();
// export const lagetNormalizedEvents = getNormalizedEvents();

// // Fixture tuples for testing - migrated to object properties but keeping the exports
// export const transformLagetTestData: [Record<string, ICalEvent>, EventSourceData[]] = [
//   lagetEventsProcessed,
//   lagetSourceEvents,
// ];

// export const enhanceLagetTestData: [EventSourceData[], EventSourceData[]] = [
//   lagetSourceEvents,
//   lagetSourceEvents.map(event => {
//     if (event.categories?.includes('Match')) {
//       // Format title for match
//       const title = event.title;
//       const parts = title.split(' - ');
//       if (parts.length === 2) {
//         const firstTeam = parts[0].replace('Match ', '').trim();
//         const isHome = firstTeam.includes('IFK Aspudden-Tellus');
//         return {
//           ...event,
//           title: `${event.sourceTeamName} vs ${isHome ? parts[1] : firstTeam}`,
//         };
//       }
//     } else if (event.categories?.includes('Träning')) {
//       // Format title for training
//       return {
//         ...event,
//         title: `${event.sourceTeamName} - Träning`,
//       };
//     }
//     return event;
//   }),
// ];

// // E2E pipeline test data
// export const lagetE2ETestData: [Record<string, ICalEvent>, CalendarEvent[]] = [
//   lagetEventsProcessed,
//   lagetNormalizedEvents,
// ];

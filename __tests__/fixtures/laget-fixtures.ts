// import { ICalEvent } from '../../src/scrapers/laget-scraper';
// import { EventSourceData } from '../../src/utils/event-normalizer';
// import { CalendarEvent } from '../../src/utils/ics-converter';

// // Sample ICS calendar events
// export const lagetEventsRaw: Record<string, ICalEvent> = {
//   '27269587@laget.se': {
//     type: 'VEVENT',
//     uid: '27269587@laget.se',
//     summary: 'Match Hammarby IF FF 20 - IFK Aspudden-Tellus Röd 1',
//     start: new Date('2025-02-01T15:00:00.000Z'),
//     end: new Date('2025-02-01T17:00:00.000Z'),
//     description:
//       'Samlingstid\n2025-02-01 15:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379049',
//     location: 'Eriksdalshallen Lilla',
//     categories: ['Match'],
//   },
//   '27624278@laget.se': {
//     type: 'VEVENT',
//     uid: '27624278@laget.se',
//     summary: 'Träning - IFK Aspudden-Tellus P2014 Blå',
//     start: new Date('2025-02-03T17:30:00.000Z'),
//     end: new Date('2025-02-03T18:30:00.000Z'),
//     description: 'Samlingstid\n2025-02-03 18:15',
//     location: 'Aspuddens Skola (Mellansalen)',
//     categories: ['Träning'],
//     geo: { lat: 59.309388, lon: 17.996511 },
//   },
//   '27269588@laget.se': {
//     type: 'VEVENT',
//     uid: '27269588@laget.se',
//     summary: 'Match IFK Aspudden-Tellus Röd 1 - Djurgårdens IF FF 3',
//     start: new Date('2025-02-09T08:00:00.000Z'),
//     end: new Date('2025-02-09T10:00:00.000Z'),
//     description:
//       'Samlingstid\n2025-02-09 08:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379073',
//     location: 'Västertorpshallen',
//     categories: ['Match'],
//     geo: { lat: 59.292712, lon: 17.976926 },
//   },
// };

// // Expected transformed source data from laget events
// export const lagetSourceEvents: EventSourceData[] = [
//   {
//     uid: '27269587@laget.se',
//     title: 'Match Hammarby IF FF 20 - IFK Aspudden-Tellus Röd 1',
//     start: new Date('2025-02-01T15:00:00.000Z'),
//     end: new Date('2025-02-01T17:00:00.000Z'),
//     description:
//       'Samlingstid\n2025-02-01 15:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379049',
//     location: 'Eriksdalshallen Lilla',
//     categories: ['Match'],
//     sourceType: 'laget',
//     sourceTeamName: 'IFK Aspudden-Tellus Röd 1',
//     rawData: lagetEventsRaw['27269587@laget.se'],
//   },
//   {
//     uid: '27624278@laget.se',
//     title: 'Träning - IFK Aspudden-Tellus P2014 Blå',
//     start: new Date('2025-02-03T17:30:00.000Z'),
//     end: new Date('2025-02-03T18:30:00.000Z'),
//     description: 'Samlingstid\n2025-02-03 18:15',
//     location: 'Aspuddens Skola (Mellansalen)',
//     categories: ['Träning'],
//     sourceType: 'laget',
//     sourceTeamName: 'IFK Aspudden-Tellus P2014 Blå',
//     rawData: lagetEventsRaw['27624278@laget.se'],
//   },
//   {
//     uid: '27269588@laget.se',
//     title: 'Match IFK Aspudden-Tellus Röd 1 - Djurgårdens IF FF 3',
//     start: new Date('2025-02-09T08:00:00.000Z'),
//     end: new Date('2025-02-09T10:00:00.000Z'),
//     description:
//       'Samlingstid\n2025-02-09 08:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379073',
//     location: 'Västertorpshallen',
//     categories: ['Match'],
//     sourceType: 'laget',
//     sourceTeamName: 'IFK Aspudden-Tellus Röd 1',
//     rawData: lagetEventsRaw['27269588@laget.se'],
//   },
// ];

// // Expected enhanced source events after source-specific enhancement
// export const lagetEnhancedSourceEvents: EventSourceData[] = [
//   {
//     uid: '27269587@laget.se',
//     title: 'IFK Aspudden-Tellus Röd 1 vs Hammarby IF FF 20',
//     start: new Date('2025-02-01T15:00:00.000Z'),
//     end: new Date('2025-02-01T17:00:00.000Z'),
//     description:
//       'Samlingstid\n2025-02-01 15:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379049',
//     location: 'Eriksdalshallen Lilla',
//     categories: ['Match'],
//     sourceType: 'laget',
//     sourceTeamName: 'IFK Aspudden-Tellus Röd 1',
//     rawData: {
//       ...lagetEventsRaw['27269587@laget.se'],
//       homeTeam: 'Hammarby IF FF 20',
//       awayTeam: 'IFK Aspudden-Tellus Röd 1',
//     },
//   },
//   {
//     uid: '27624278@laget.se',
//     title: 'IFK Aspudden-Tellus P2014 Blå - Träning',
//     start: new Date('2025-02-03T17:30:00.000Z'),
//     end: new Date('2025-02-03T18:30:00.000Z'),
//     description: 'Samlingstid\n2025-02-03 18:15',
//     location: 'Aspuddens Skola (Mellansalen)',
//     categories: ['Träning'],
//     sourceType: 'laget',
//     sourceTeamName: 'IFK Aspudden-Tellus P2014 Blå',
//     rawData: lagetEventsRaw['27624278@laget.se'],
//   },
//   {
//     uid: '27269588@laget.se',
//     title: 'IFK Aspudden-Tellus Röd 1 vs Djurgårdens IF FF 3',
//     start: new Date('2025-02-09T08:00:00.000Z'),
//     end: new Date('2025-02-09T10:00:00.000Z'),
//     description:
//       'Samlingstid\n2025-02-09 08:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379073',
//     location: 'Västertorpshallen',
//     categories: ['Match'],
//     sourceType: 'laget',
//     sourceTeamName: 'IFK Aspudden-Tellus Röd 1',
//     rawData: {
//       ...lagetEventsRaw['27269588@laget.se'],
//       homeTeam: 'IFK Aspudden-Tellus Röd 1',
//       awayTeam: 'Djurgårdens IF FF 3',
//     },
//   },
// ];

// // Expected normalized events after processing
// export const lagetNormalizedEvents: CalendarEvent[] = [
//   {
//     uid: '27269587@laget.se',
//     title: 'IFK Aspudden-Tellus Röd 1 vs Hammarby IF FF 20',
//     start: new Date('2025-02-01T15:00:00.000Z'),
//     end: new Date('2025-02-01T17:00:00.000Z'),
//     description:
//       'Samlingstid\n2025-02-01 15:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379049',
//     location: 'Eriksdalshallen Lilla',
//     categories: ['Match', 'Away'],
//     activity: 'Match',
//     gender: 'male',
//     ageGroup: '2014',
//     awayTeam: 'IFK Aspudden-Tellus Röd 1',
//     homeTeam: 'Hammarby IF FF 20',
//     match: 'away',
//     normalizedVenue: [],
//     color: 'Blå', // Away match color (changed from hex code)
//   },
//   {
//     uid: '27624278@laget.se',
//     title: 'IFK Aspudden-Tellus P2014 Blå - Träning',
//     start: new Date('2025-02-03T17:30:00.000Z'),
//     end: new Date('2025-02-03T18:30:00.000Z'),
//     description: 'Samlingstid\n2025-02-03 18:15',
//     location: 'Aspuddens Skola (Mellansalen)',
//     categories: ['Träning', 'Aspuddens Skola', 'Mellansalen'],
//     activity: 'Träning',
//     gender: 'male',
//     ageGroup: '2014',
//     normalizedTeam: 'ifk aspudden-tellus p2014 blå',
//     normalizedVenue: ['Aspuddens Skola', 'Mellansalen'],
//     color: 'Blå', // Blue team color (changed from hex code)
//   },
//   {
//     uid: '27269588@laget.se',
//     title: 'IFK Aspudden-Tellus Röd 1 vs Djurgårdens IF FF 3',
//     start: new Date('2025-02-09T08:00:00.000Z'),
//     end: new Date('2025-02-09T10:00:00.000Z'),
//     description:
//       'Samlingstid\n2025-02-09 08:30\n\nLäs mer om matchen\nhttps://www.laget.se/P2014B/Division/Game/544972/11379073',
//     location: 'Västertorpshallen',
//     categories: ['Match', 'Home', 'Västertorpshallen'],
//     activity: 'Match',
//     gender: 'male',
//     ageGroup: '2014',
//     homeTeam: 'IFK Aspudden-Tellus Röd 1',
//     awayTeam: 'Djurgårdens IF FF 3',
//     match: 'home',
//     normalizedVenue: ['Västertorpshallen'],
//     color: 'Grön', // Home match color (changed from hex code)
//   },
// ];

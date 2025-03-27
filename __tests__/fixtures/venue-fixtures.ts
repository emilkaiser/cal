// import { Match } from '../../src/scrapers/venue-scraper';
// import { EventSourceData } from '../../src/utils/event-normalizer';
// import { CalendarEvent } from '../../src/utils/ics-converter';

// // Sample venue API response
// export const venueMatchesRaw: Match[] = [
//   {
//     id: 1001,
//     location: 'Aspuddens IP 1',
//     category: 'Division 4A Herrar',
//     date: {
//       iso8601: '2023-09-15T19:00:00+02:00',
//       formatted: '15 sep 19:00',
//     },
//     home: {
//       team: 'IFK Aspudden-Tellus',
//     },
//     away: {
//       team: 'Enskede IK',
//     },
//     url: '/match/1001',
//   },
//   {
//     id: 1002,
//     location: 'Aspuddens IP 2',
//     category: 'P14 Lätt',
//     date: {
//       iso8601: '2023-09-16T10:00:00+02:00',
//       formatted: '16 sep 10:00',
//     },
//     home: {
//       team: 'IFK Aspudden-Tellus P14',
//     },
//     away: {
//       team: 'Hammarby IF FF P14',
//     },
//     note: 'Uppvärmningsmatch',
//     url: '/match/1002',
//   },
//   {
//     id: 1003,
//     location: 'Västberga IP',
//     category: 'F12 Medel',
//     date: {
//       iso8601: '2023-09-16T12:30:00+02:00',
//       formatted: '16 sep 12:30',
//     },
//     home: {
//       team: 'IFK Aspudden-Tellus F12',
//     },
//     away: {
//       team: 'Älvsjö AIK FF F12',
//     },
//     url: '/match/1003',
//   },
// ];

// // Expected transformed source data from venue matches
// export const venueSourceEvents: EventSourceData[] = [
//   {
//     uid: 'venue-match-1001',
//     title: 'IFK Aspudden-Tellus vs Enskede IK',
//     start: new Date('2023-09-15T17:00:00.000Z'),
//     end: new Date('2023-09-15T18:30:00.000Z'),
//     description: 'Division 4A Herrar',
//     location: 'Aspuddens IP 1',
//     url: 'https://www.stff.se/match/1001',
//     categories: ['Division 4A Herrar'],
//     sourceType: 'venue',
//     rawData: venueMatchesRaw[0],
//   },
//   {
//     uid: 'venue-match-1002',
//     title: 'IFK Aspudden-Tellus P14 vs Hammarby IF FF P14',
//     start: new Date('2023-09-16T08:00:00.000Z'),
//     end: new Date('2023-09-16T09:30:00.000Z'),
//     description: 'P14 Lätt - Uppvärmningsmatch',
//     location: 'Aspuddens IP 2',
//     url: 'https://www.stff.se/match/1002',
//     categories: ['P14 Lätt'],
//     sourceType: 'venue',
//     rawData: venueMatchesRaw[1],
//   },
//   {
//     uid: 'venue-match-1003',
//     title: 'IFK Aspudden-Tellus F12 vs Älvsjö AIK FF F12',
//     start: new Date('2023-09-16T10:30:00.000Z'),
//     end: new Date('2023-09-16T12:00:00.000Z'),
//     description: 'F12 Medel',
//     location: 'Västberga IP',
//     url: 'https://www.stff.se/match/1003',
//     categories: ['F12 Medel'],
//     sourceType: 'venue',
//     rawData: venueMatchesRaw[2],
//   },
// ];

// // Expected normalized events after processing
// export const venueNormalizedEvents: CalendarEvent[] = [
//   {
//     uid: 'venue-match-1001',
//     title: 'IFK Aspudden-Tellus vs Enskede IK',
//     start: new Date('2023-09-15T17:00:00.000Z'),
//     end: new Date('2023-09-15T18:30:00.000Z'),
//     description: 'Division 4A Herrar',
//     location: 'Aspuddens IP 1',
//     url: 'https://www.stff.se/match/1001',
//     categories: ['Division 4A Herrar', 'Home', 'Aspuddens IP', 'Aspuddens IP 1'],
//     activity: 'Match',
//     gender: 'male',
//     homeTeam: 'IFK Aspudden-Tellus',
//     awayTeam: 'Enskede IK',
//     match: 'home',
//     normalizedVenue: ['Aspuddens IP', 'Aspuddens IP 1'],
//   },
//   {
//     uid: 'venue-match-1002',
//     title: 'IFK Aspudden-Tellus P14 vs Hammarby IF FF P14',
//     start: new Date('2023-09-16T08:00:00.000Z'),
//     end: new Date('2023-09-16T09:30:00.000Z'),
//     description: 'P14 Lätt - Uppvärmningsmatch',
//     location: 'Aspuddens IP 2',
//     url: 'https://www.stff.se/match/1002',
//     categories: ['P14 Lätt', 'Home', 'Aspuddens IP', 'Aspuddens IP 2'],
//     activity: 'Match',
//     gender: 'male',
//     ageGroup: 'P14',
//     homeTeam: 'IFK Aspudden-Tellus P14',
//     awayTeam: 'Hammarby IF FF P14',
//     match: 'home',
//     normalizedVenue: ['Aspuddens IP', 'Aspuddens IP 2'],
//   },
//   {
//     uid: 'venue-match-1003',
//     title: 'IFK Aspudden-Tellus F12 vs Älvsjö AIK FF F12',
//     start: new Date('2023-09-16T10:30:00.000Z'),
//     end: new Date('2023-09-16T12:00:00.000Z'),
//     description: 'F12 Medel',
//     location: 'Västberga IP',
//     url: 'https://www.stff.se/match/1003',
//     categories: ['F12 Medel', 'Home', 'Västberga IP'],
//     activity: 'Match',
//     gender: 'female',
//     ageGroup: 'F12',
//     homeTeam: 'IFK Aspudden-Tellus F12',
//     awayTeam: 'Älvsjö AIK FF F12',
//     match: 'home',
//     normalizedVenue: ['Västberga IP'],
//   },
// ];

// // Fixture tuples for easier testing - [input, expected output]
// export const transformVenueTestData: [Match[], EventSourceData[]] = [
//   venueMatchesRaw,
//   venueSourceEvents,
// ];

// export const enhanceVenueTestData: [EventSourceData[], EventSourceData[]] = [
//   venueSourceEvents,
//   venueSourceEvents,
// ];

// export const normalizeVenueTestData: [EventSourceData[], CalendarEvent[]] = [
//   venueSourceEvents,
//   venueNormalizedEvents,
// ];

// // E2E pipeline test data
// export const venueE2ETestData: [Match[], CalendarEvent[]] = [
//   venueMatchesRaw,
//   venueNormalizedEvents,
// ];

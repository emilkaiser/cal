// import { transformToSourceData, enhanceSourceEvents } from '../../src/scrapers/venue-scraper';
// import { normalizeEvents } from '../../src/utils/event-normalizer';
// import {
//   venueMatchesRaw,
//   venueSourceEvents,
//   venueNormalizedEvents,
// } from '../fixtures/venue-fixtures';
// import { registerMockResponse, clearMockResponses } from '../mocks/fetch-mock';

// describe('Venue Scraper', () => {
//   beforeEach(() => {
//     clearMockResponses();
//   });

//   describe('transformToSourceData', () => {
//     it('should transform venue matches into source events', () => {
//       const result = transformToSourceData(venueMatchesRaw);

//       expect(result).toHaveLength(venueMatchesRaw.length);

//       // Check that first result matches expected
//       expect(result[0].uid).toBe('venue-match-1001');
//       expect(result[0].title).toBe('IFK Aspudden-Tellus vs Enskede IK');
//       expect(result[0].start).toEqual(new Date('2023-09-15T17:00:00.000Z'));
//       expect(result[0].end).toEqual(new Date('2023-09-15T18:30:00.000Z'));
//       expect(result[0].location).toBe('Aspuddens IP 1');
//       expect(result[0].categories).toEqual(['Division 4A Herrar']);
//       expect(result[0].sourceType).toBe('venue');

//       // Check that description includes note when available
//       expect(result[1].description).toContain('Uppvärmningsmatch');
//     });

//     it('should handle empty matches array', () => {
//       const result = transformToSourceData([]);
//       expect(result).toEqual([]);
//     });
//   });

//   describe('enhanceSourceEvents', () => {
//     it('should enhance source events with venue-specific information', () => {
//       const result = enhanceSourceEvents(venueSourceEvents);

//       // Since our implementation doesn't add much venue-specific info,
//       // we mainly verify structure is maintained
//       expect(result).toHaveLength(venueSourceEvents.length);
//       expect(result[0].uid).toBe(venueSourceEvents[0].uid);
//       expect(result[0].title).toBe(venueSourceEvents[0].title);
//     });
//   });

//   describe('End-to-end processing', () => {
//     it('should process venue matches through the entire pipeline', () => {
//       // Transform raw matches to source events
//       const sourceEvents = transformToSourceData(venueMatchesRaw);

//       // Apply venue-specific enhancements
//       const enhancedSourceEvents = enhanceSourceEvents(sourceEvents);

//       // Apply common normalization
//       const normalizedEvents = normalizeEvents(enhancedSourceEvents);

//       // Verify all steps worked together correctly
//       expect(normalizedEvents).toHaveLength(venueMatchesRaw.length);

//       // Check fields on first event
//       const firstEvent = normalizedEvents[0];
//       expect(firstEvent.title).toBe('IFK Aspudden-Tellus vs Enskede IK');
//       expect(firstEvent.activity).toBe('Match');
//       expect(firstEvent.match).toBe('home');
//       expect(firstEvent.normalizedVenue).toEqual(['Aspuddens IP', 'Aspuddens IP 1']);

//       // Check categories were added correctly
//       expect(firstEvent.categories).toContain('Division 4A Herrar');
//       expect(firstEvent.categories).toContain('Home');
//       expect(firstEvent.categories).toContain('Aspuddens IP');
//     });
//   });
// });

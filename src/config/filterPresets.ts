import { DataSource } from '@/lib/data-sources';
import { CalendarEvent } from '@/types/types';

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  selectedSources: string[];
  hiddenSources: string[];
  globalFilters: { [filterType: string]: string[] };
  sourceFilters: { [sourceId: string]: string[] };
}

// Define presets that users can select from
export const filterPresets: FilterPreset[] = [
  {
    id: 'all',
    name: 'All Events',
    description: 'Show all calendar events from all sources',
    selectedSources: [
      'laget',
      'venue-aspuddens-ip-1',
      'venue-aspuddens-ip-2',
      'venue-vastberga-ip',
    ],
    hiddenSources: [],
    globalFilters: {},
    sourceFilters: {},
  },
  {
    id: 'matches-only',
    name: 'Matches Only',
    description: 'Show only match events from all sources',
    selectedSources: [
      'laget',
      'venue-aspuddens-ip-1',
      'venue-aspuddens-ip-2',
      'venue-vastberga-ip',
    ],
    hiddenSources: [],
    globalFilters: { activity: ['Match'] }, // Just use one consistent format
    sourceFilters: {},
  },
  {
    id: 'training-only',
    name: 'Training Only',
    description: 'Show only training events from all sources',
    selectedSources: [
      'laget',
      'venue-aspuddens-ip-1',
      'venue-aspuddens-ip-2',
      'venue-vastberga-ip',
    ],
    hiddenSources: [],
    globalFilters: { activity: ['Training'] }, // Just use one consistent format
    sourceFilters: {},
  },
  {
    id: 'aspudden-events',
    name: 'Aspudden Venues',
    description: 'Show events at Aspudden venues only',
    selectedSources: ['venue-aspuddens-ip-1', 'venue-aspuddens-ip-2'],
    hiddenSources: ['laget', 'venue-vastberga-ip'],
    globalFilters: {},
    sourceFilters: {},
  },
  {
    id: 'herrlag',
    name: 'Herrlag',
    description: 'A-lag Herrar',
    selectedSources: ['laget'],
    hiddenSources: ['venue-aspuddens-ip-1', 'venue-aspuddens-ip-2', 'venue-vastberga-ip'],
    globalFilters: {},
    sourceFilters: { laget: ['team:A-lag Herrar'] },
  },
  {
    id: 'p19',
    name: 'P19 (herrjuniorer)',
    description: 'Junior team events',
    selectedSources: ['laget'],
    hiddenSources: ['venue-aspuddens-ip-1', 'venue-aspuddens-ip-2', 'venue-vastberga-ip'],
    globalFilters: {},
    sourceFilters: { laget: ['team:P19 (herrjuniorer)'] },
  },
  {
    id: 'upcoming',
    name: 'Next 7 Days',
    description: 'Show events in the next 7 days',
    selectedSources: [
      'laget',
      'venue-aspuddens-ip-1',
      'venue-aspuddens-ip-2',
      'venue-vastberga-ip',
    ],
    hiddenSources: [],
    globalFilters: {},
    sourceFilters: {},
    // The date filtering will be handled in the component
  },
];

// Also export as an object for components that expect that format
export const filterPresetsObject: { [key: string]: FilterPreset } = filterPresets.reduce(
  (acc, preset) => {
    acc[preset.id] = preset;
    return acc;
  },
  {} as { [key: string]: FilterPreset }
);

// Function to find a preset by ID
export const getPresetById = (presetId: string): FilterPreset | undefined => {
  return filterPresets.find(preset => preset.id === presetId);
};

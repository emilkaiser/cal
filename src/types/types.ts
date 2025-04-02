export const MATCH_HOME = 'Home' as const;
export const MATCH_AWAY = 'Away' as const;
export const MATCH_EXTERNAL = 'External' as const;
export type Match = typeof MATCH_HOME | typeof MATCH_AWAY | typeof MATCH_EXTERNAL;

export const TRAINING = 'Träning' as const;
export const MATCH = 'Match' as const;
export const CUP = 'Cup' as const;
export const TURNERING = 'Turnering' as const;
export const MEETING = 'Möte' as const;
export const EVENT = 'Event' as const;
export const OTHER = 'Övrigt' as const;
export type Activity =
  | typeof MATCH
  | typeof TRAINING
  | typeof CUP
  | typeof TURNERING
  | typeof MEETING
  | typeof EVENT
  | typeof OTHER;

export type SourceType = 'laget' | 'team' | 'venue' | 'other';

export const BOYS = 'Pojkar' as const;
export const GIRLS = 'Flickor' as const;
export const WOMEN = 'Dam' as const;
export const MEN = 'Herr' as const;
export const BOYS_GIRLS = 'Pojkar+Flickor' as const;
export const MEN_VETERAN = 'Herrveteran' as const;
export const WOMEN_VETERAN = 'Damveteran' as const;
export const MEN_JUNIOR = 'Herrjunior' as const;
export const WOMEN_JUNIOR = 'Damjunior' as const;
export type Gender =
  | typeof BOYS
  | typeof GIRLS
  | typeof WOMEN
  | typeof MEN
  | typeof BOYS_GIRLS
  | typeof MEN_VETERAN
  | typeof WOMEN_VETERAN
  | typeof MEN_JUNIOR
  | typeof WOMEN_JUNIOR;

export interface CalendarEvent {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  categories?: string[];
  sourceType: string;
  rawData: any;
  activity?: Activity;
  venues?: string[];
  match?: Match;
  opponent?: string;
  formattedTeam?: string;
  color?: string;
  gender?: Gender;
  ageGroup?: string;
  team?: string;
  url?: string;
  formattedTitle?: string;
  filterTags?: string[];
  rawTeam?: string;
  source?: string; // Added source property
  series?: string;
}

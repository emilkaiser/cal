export type Match = 'Home' | 'Away' | undefined;
export type Activity =
  | 'Match'
  | 'Träning'
  | 'Cup'
  | 'Turnering'
  | 'Möte'
  | 'Event'
  | 'Övrigt'
  | 'unknown';
export type SourceType = 'laget' | 'team' | 'venue' | 'other';
export type Gender = 'Pojkar' | 'Flickor' | 'unknown';

export interface CalendarEvent {
  uid?: string;
  title: string;
  formattedTitle?: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  url?: string;
  categories?: string[];
  homeTeam?: string;
  awayTeam?: string;
  ageGroup?: string;
  gender?: Gender;
  venues?: string[];
  match?: Match;
  opponent?: string;
  activity?: Activity;
  color?: string;
  team?: string;
  hex?: string;
  filterTags?: string[];
  sourceType: SourceType;
  rawData?: unknown; // Original data for reference
}

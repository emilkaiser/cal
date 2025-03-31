export type Match = 'Home' | 'Away' | 'External';
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
export type Gender = 'Pojkar' | 'Flickor' | 'Dam' | 'Herr' | 'unknown' | string;

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
}

declare module 'node-ical' {
  export interface ICalEvent {
    type: string;
    uid: string;
    summary: string;
    description?: string;
    start: Date;
    end: Date;
    location?: string;
    url?: string;
    categories?: string | string[];
    geo?: {
      lat: number;
      lon: number;
    };
    status?: string;
    dtstamp?: Date;
  }

  export function parseICS(icsData: string): Promise<Record<string, ICalEvent>>;
  export function parseFile(filename: string): Promise<Record<string, ICalEvent>>;
  export function fromURL(url: string): Promise<Record<string, ICalEvent>>;
}

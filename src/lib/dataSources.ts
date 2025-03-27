import lagetData from '@/data/laget/calendar.json';

import p2014bData from '@/data/team/p2014-bla.json';
import p2014gData from '@/data/team/p2014-gul.json';
import p2014rData from '@/data/team/p2014-rod.json';

import aspuddensIp1 from '@/data/venue/aspuddens-ip-1.json';
import aspuddensIp2 from '@/data/venue/aspuddens-ip-2.json';
import vastbergaIp from '@/data/venue/vastberga-ip.json';
import { CalendarEvent } from '../types/types';

export interface DataSource {
  id: string;
  name: string;
  events: CalendarEvent[];
  color: string;
}

// Create data sources from the team JSON files
export const getTeamDataSources = (): DataSource[] => {
  const sources: DataSource[] = [];

  // Add the team data we know about
  sources.push({
    id: 'team-p2014-bla',
    name: 'Team: p2014-bla',
    events: normalize(p2014bData),
    color: 'hsl(120, 70%, 50%)', // Green color
  });

  sources.push({
    id: 'team-p2014-gul',
    name: 'Team: p2014-gul',
    events: normalize(p2014gData),
    color: 'hsl(60, 70%, 50%)', // Yellow color
  });

  sources.push({
    id: 'team-p2014-rod',
    name: 'Team: p2014-rod',
    events: normalize(p2014rData),
    color: 'hsl(0, 70%, 50%)', // Red color
  });

  // Add more team data sources as needed
  // sources.push({
  //   id: 'team-another-team',
  //   name: 'Team: Another Team',
  //   events: anotherTeamData,
  //   color: 'hsl(180, 70%, 50%)'
  // });

  return sources;
};

// Create data sources from the venue JSON files
export const getVenueDataSources = (): DataSource[] => {
  const sources: DataSource[] = [];

  sources.push({
    id: 'venue-aspuddens-ip-1',
    name: 'Aspuddens IP 1',
    events: normalize(aspuddensIp1),
    color: 'hsl(240, 70%, 50%)',
  });

  sources.push({
    id: 'venue-aspuddens-ip-2',
    name: 'Aspuddens IP 2',
    events: normalize(aspuddensIp2),
    color: 'hsl(270, 70%, 50%)',
  });

  sources.push({
    id: 'venue-vastberga-ip',
    name: 'Västberga IP',
    events: normalize(vastbergaIp),
    color: 'hsl(300, 70%, 50%)',
  });

  return sources;
};

// Create laget data source
export const getLagetDataSource = (): DataSource => {
  const data = normalize(lagetData as any[]).map(event => ({
    ...event,
    title: event.formattedTitle,
  }));
  return {
    id: 'laget',
    name: 'Laget Calendar',
    events: data as CalendarEvent[],
    color: 'hsl(210, 70%, 50%)',
  };
};

// Helper function to ensure all events have a URL property and dates are converted to Date objects
function normalize(events: any[]): CalendarEvent[] {
  return events.map(event => ({
    ...event,
    url: event.url || '#', // Add a default URL if missing
    start: event.start instanceof Date ? event.start : new Date(event.start),
    end: event.end instanceof Date ? event.end : new Date(event.end),
    sourceType: event.sourceType || 'other',
  }));
}

// Get all available data sources
export const getAllDataSources = (): DataSource[] => {
  return [
    getLagetDataSource(),
    //...getTeamDataSources(),
    //...getVenueDataSources()
  ];
};

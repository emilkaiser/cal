'use client';

import { useMemo, useState, useEffect } from 'react';
import TeamCalendar from './TeamCalendar';
import type { CalendarEvent as BaseCalendarEvent } from '../types/types';
import { DataSource } from '@/lib/data-sources';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, RefreshCcw } from 'lucide-react';
import moment from 'moment';

interface CalendarClientProps {
  initialEvents: BaseCalendarEvent[];
  dataSources: DataSource[];
}

// Cache for normalized events to prevent recalculation
const normalizedEventsCache = new WeakMap();

export default function CalendarClient({ initialEvents, dataSources }: CalendarClientProps) {
  // Process events only once using useMemo
  const processedEvents = useMemo(() => {
    // Check cache first
    if (normalizedEventsCache.has(initialEvents)) {
      return normalizedEventsCache.get(initialEvents);
    }

    // Parse date strings to Date objects with proper timezone handling
    const parsedEvents = initialEvents.map(event => ({
      ...event,
      start: moment.utc(event.start).toDate(),
      end: moment.utc(event.end).toDate(),
    }));

    // Store in cache
    normalizedEventsCache.set(initialEvents, parsedEvents);
    return parsedEvents;
  }, [initialEvents]);

  return <TeamCalendar events={processedEvents} dataSources={dataSources} />;
}

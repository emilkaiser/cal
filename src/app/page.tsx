'use client';

import { getAllCalendarEvents, getDataSources } from '@/lib/data';
import CalendarClient from '@/components/CalendarClient';
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  // Load data on the server
  const events = getAllCalendarEvents();
  const dataSources = getDataSources();

  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <main className="container py-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Team Games Calendar</h1>
          <ModeToggle />
        </div>
        <CalendarClient initialEvents={events} dataSources={dataSources} />
      </main>
    </ThemeProvider>
  );
}

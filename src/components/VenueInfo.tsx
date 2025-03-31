import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VenueInfoProps {
  name: string;
  location?: string;
  description?: string;
  eventsCount?: number;
  nextEvents?: {
    title: string;
    date: string;
    time: string;
    filterTags?: string[];
  }[];
}

export default function VenueInfo({
  name,
  location,
  description,
  eventsCount = 0,
  nextEvents = [],
}: VenueInfoProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
          {eventsCount > 0 && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <Badge variant="secondary">{eventsCount} events</Badge>
            </div>
          )}
        </div>
        {location && (
          <CardDescription className="flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {location}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {description && <p className="text-muted-foreground">{description}</p>}

        {nextEvents && nextEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming Events
            </h4>
            <div className="space-y-2">
              {nextEvents.map((event, idx) => {
                // Get team from filterTags if available
                const team = event.filterTags?.find(tag => tag.startsWith('team:'))?.split(':')[1];
                const activity = event.filterTags
                  ?.find(tag => tag.startsWith('activity:'))
                  ?.split(':')[1];

                return (
                  <div key={idx} className="border rounded-md p-2 text-sm">
                    <div className="font-medium">{event.title}</div>
                    {team && <div className="text-xs text-muted-foreground">Team: {team}</div>}
                    {activity && (
                      <div className="text-xs text-muted-foreground">Activity: {activity}</div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>{event.date}</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

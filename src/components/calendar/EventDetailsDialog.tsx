'use client';

import moment from 'moment';
import { CalendarEvent } from '@/types/types';
import { DataSource } from '@/lib/data-sources';
import { getPropertyFromFilterTags } from '@/scrapers/utils/calendar-utils';
import { getDataSourceColor } from '@/lib/color-utils';
import { MATCH_HOME, MATCH_AWAY } from '@/types/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Calendar as CalendarIcon,
  ExternalLink,
  MapPin,
  Settings,
  Users,
} from 'lucide-react';

interface EventDetailsDialogProps {
  selectedEvent: CalendarEvent;
  closeDialog: () => void;
  dataSources: DataSource[];
}

export const EventDetailsDialog = ({
  selectedEvent,
  closeDialog,
  dataSources,
}: EventDetailsDialogProps) => {
  return (
    <Dialog open={true} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {selectedEvent.title || 'Untitled Event'}
            {selectedEvent.match === MATCH_HOME && (
              <Badge className="bg-green-500 text-white">Home</Badge>
            )}
            {selectedEvent.match === MATCH_AWAY && (
              <Badge className="bg-blue-500 text-white">Away</Badge>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1 text-sm">
            <CalendarIcon className="h-3.5 w-3.5" />
            {moment(selectedEvent.start).format('dddd, MMMM D, YYYY')} •
            {moment(selectedEvent.start).format(' h:mm A')} -
            {moment(selectedEvent.end).format(' h:mm A')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-[auto_1fr] gap-2">
            {(selectedEvent.team ||
              selectedEvent.filterTags?.some(tag => tag.startsWith('team:'))) && (
              <div className="contents">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                </div>
                <span>
                  {selectedEvent.team || selectedEvent.filterTags
                    ? getPropertyFromFilterTags(selectedEvent.filterTags, 'team')
                    : ''}
                </span>
              </div>
            )}

            {selectedEvent.venues && selectedEvent.venues.length > 0 && (
              <div className="contents">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>{selectedEvent.venues.join(', ')}</span>
              </div>
            )}

            {selectedEvent.activity && (
              <div className="contents">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span>{selectedEvent.activity}</span>
              </div>
            )}

            {selectedEvent.source && (
              <div className="contents">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Settings className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getDataSourceColor(selectedEvent.source),
                    }}
                  />
                  <span>
                    {dataSources.find(s => s.id === selectedEvent.source)?.name ||
                      selectedEvent.source}
                  </span>
                </div>
              </div>
            )}
          </div>

          {selectedEvent.categories && selectedEvent.categories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1.5">Categories</h4>
              <div className="flex flex-wrap gap-1">
                {selectedEvent.categories.map((category, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {selectedEvent.description && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-1.5">Description</h4>
                <div className="text-sm whitespace-pre-line border rounded-md p-3 bg-muted/30">
                  {selectedEvent.description}
                </div>
              </div>
            </>
          )}

          {selectedEvent.ageGroup && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Age Group:</span>
              <Badge variant="outline">{selectedEvent.ageGroup}</Badge>
              {selectedEvent.gender && <Badge variant="outline">{selectedEvent.gender}</Badge>}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center gap-2 sm:gap-0">
          {selectedEvent.url && (
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => window.open(selectedEvent.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              Open External Link
            </Button>
          )}
          <Button variant="default" onClick={closeDialog}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

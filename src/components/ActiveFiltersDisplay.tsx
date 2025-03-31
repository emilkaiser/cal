import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FilterItem {
  label: string;
  type: string;
  value: string;
}

interface ActiveFiltersDisplayProps {
  filters: FilterItem[];
  onRemoveFilter: (type: string, value: string) => void;
  onClearAll: () => void;
}

export default function ActiveFiltersDisplay({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersDisplayProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded">
      <span className="text-sm font-medium self-center mr-1">Active Filters:</span>
      {filters.map((filter, index) => (
        <Badge
          key={`${filter.type}-${filter.value}-${index}`}
          variant="secondary"
          className="flex items-center gap-1 px-2 py-1"
        >
          {filter.label}
          <button
            className="ml-1 text-xs rounded-full bg-muted w-4 h-4 inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onRemoveFilter(filter.type, filter.value)}
            aria-label={`Remove filter ${filter.label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {filters.length > 0 && (
        <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={onClearAll}>
          Clear All
        </Button>
      )}
    </div>
  );
}

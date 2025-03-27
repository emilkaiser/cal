import { Activity } from '../types/types';

export const ACTIVITY_TYPES = {
  MATCH: 'Match',
  TRAINING: 'Träning',
  CUP: 'Cup',
  TOURNAMENT: 'Turnering',
  MEETING: 'Möte',
  EVENT: 'Event',
  OTHER: 'Övrigt',
} as const;

/**
 * Determines the activity type from event categories
 * @param categories Array of category strings
 * @returns Activity type or "unknown"
 */
export function getActivityTypeFromCategories(categories: string[] | undefined): Activity {
  if (!categories || categories.length === 0) return 'unknown';

  if (categories.includes('Match')) return ACTIVITY_TYPES.MATCH;
  if (categories.includes('Träning')) return ACTIVITY_TYPES.TRAINING;
  if (categories.includes('Övrig aktivitet')) return ACTIVITY_TYPES.OTHER;

  return 'unknown';
}

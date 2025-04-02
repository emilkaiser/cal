import { Activity, CUP, MATCH, OTHER, TRAINING } from '../../types/types';

export function getActivityTypeFromCategories(
  categories: string[] | undefined
): Activity | undefined {
  if (!categories || categories.length === 0) return undefined;

  if (categories.includes('Match')) return MATCH;
  if (categories.includes('Träning')) return TRAINING;
  if (categories.includes('Övrig aktivitet')) return OTHER;

  return undefined;
}

export function getCupTypeFromTitle(title: string | undefined): Activity | undefined {
  if (!title) return undefined;

  const lowerCaseTitle = title.toLowerCase();
  if (lowerCaseTitle.includes('cup')) return CUP;

  return undefined;
}

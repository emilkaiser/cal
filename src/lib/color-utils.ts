import type { DataSource } from '@/lib/data-sources';

// Color palette for different data sources
const dataSourceColors: Record<string, string> = {
  laget: '#4F46E5', // Indigo
  venue: '#16A34A', // Green
  google: '#EA4335', // Red
  outlook: '#0078D4', // Blue
  apple: '#A2AAAD', // Silver
  spond: '#FF5A00', // Orange
  // Add more sources as needed
};

// Default color when source is not found or undefined
const defaultColor = '#6B7280'; // Gray

/**
 * Get the color for a specific data source
 */
export function getDataSourceColor(sourceId: string | undefined): string {
  if (!sourceId) return defaultColor;
  const key = sourceId.toLowerCase(); // <-- force lower case to match palette keys
  return dataSourceColors[key] || defaultColor;
}

/**
 * Get a color map for multiple data sources
 */
export function getDataSourceColors(dataSources: DataSource[]): Record<string, string> {
  return dataSources.reduce(
    (colors, source) => ({
      ...colors,
      [source.id]: dataSourceColors[source.id] || defaultColor,
    }),
    {} as Record<string, string>
  );
}

/**
 * Apply a lighter version of the color for background with proper contrast
 */
export function getLightColor(color: string, opacity: number = 0.2): string {
  return `${color}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')}`;
}

/**
 * Get the event style based on its source
 */
export function getEventStyle(sourceId: string | undefined) {
  const color = getDataSourceColor(sourceId);
  return {
    backgroundColor: getLightColor(color),
    borderLeft: `4px solid ${color}`,
    color: 'black', // Ensure readability with light background
  };
}

/**
 * Check if a color is dark to determine text color
 */
export function isColorDark(color: string): boolean {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(color: string, percent: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const darkenAmount = percent / 100;
  const dr = Math.floor(r * (1 - darkenAmount));
  const dg = Math.floor(g * (1 - darkenAmount));
  const db = Math.floor(b * (1 - darkenAmount));

  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db
    .toString(16)
    .padStart(2, '0')}`;
}

/**
 * Get full calendar event style based on source
 */
export function getCalendarEventStyle(sourceId: string | undefined, customColor?: string) {
  const color = customColor || getDataSourceColor(sourceId);
  return {
    backgroundColor: color,
    color: isColorDark(color) ? '#ffffff' : '#000000',
    borderRadius: '4px',
    border: `1px solid ${darkenColor(color, 10)}`,
  };
}

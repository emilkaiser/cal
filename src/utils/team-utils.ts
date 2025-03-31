/**
 * Maps color names to hex color codes
 */
const colorMap: Record<string, string> = {
  // English color names
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  pink: '#ec4899',
  gray: '#6b7280',
  orange: '#f97316',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  lime: '#84cc16',
  emerald: '#10b981',
  sky: '#0ea5e9',
  fuchsia: '#d946ef',
  rose: '#f43f5e',
  white: '#ffffff',
  black: '#000000',

  // Swedish color names
  röd: '#ef4444', // Red
  blå: '#3b82f6', // Blue
  grön: '#22c55e', // Green
  gul: '#eab308', // Yellow
  lila: '#a855f7', // Purple
  rosa: '#ec4899', // Pink
  grå: '#6b7280', // Gray
  //orange: '#f97316', // Orange (same in Swedish)
  vit: '#ffffff', // White
  svart: '#000000', // Black

  // Other common translations might be added here

  unknown: '#6b7280', // Default to gray
};

/**
 * Gets a hex color code from a color name
 * @param colorName The name of the color
 * @returns The hex color code for the color
 */
export function getHexColor(colorName: string): string {
  if (!colorName) return '#6b7280'; // Default gray for empty colors

  const normalizedColor = colorName.toLowerCase().trim();

  // Return the color if it exists in our map
  if (normalizedColor in colorMap) {
    return colorMap[normalizedColor];
  }

  // Check if it's already a valid hex color
  if (/^#([0-9A-F]{3}){1,2}$/i.test(colorName)) {
    return colorName;
  }

  // Check if it's an RGB or HSL value
  if (colorName.startsWith('rgb') || colorName.startsWith('hsl')) {
    return colorName;
  }

  // For unknown colors, generate a deterministic color
  return stringToColor(colorName);
}

/**
 * Generate a deterministic color based on a string (like venue name)
 * This ensures the same venue always gets the same color
 */
export function getVenueColor(venueName: string): string {
  // Use a simple hash function to generate a number from the string
  let hash = 0;
  for (let i = 0; i < venueName.length; i++) {
    hash = venueName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // We'll use HSL to ensure good contrast and saturation
  // Use hash to get a hue between 0-360
  const hue = Math.abs(hash) % 360;

  // Fixed saturation and lightness for good readability
  return `hsl(${hue}, 80%, 45%)`;
}

/**
 * Generates a deterministic color from a string
 * @param input Any string input
 * @returns A hex color code
 */
export function stringToColor(input: string): string {
  // Simple hash function to convert string to a number
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to hex color
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }

  return color;
}

/**
 * Determines if a color is light or dark
 * @param color Hex color code
 * @returns Boolean indicating if the color is light
 */
export function isLightColor(color: string): boolean {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance - weights from ITU-R BT.709
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return true if color is light (luminance > 0.5)
  return luminance > 0.5;
}

/**
 * Returns a contrasting color that works well with most team colors
 */
export function getContrastingColor(index: number): string {
  // Define an array of contrasting, accessible colors
  const contrastColors = [
    'hsl(230, 70%, 50%)', // Blue
    'hsl(160, 70%, 40%)', // Teal
    'hsl(340, 80%, 50%)', // Pink
    'hsl(40, 90%, 45%)', // Orange
    'hsl(270, 70%, 50%)', // Purple
    'hsl(200, 80%, 45%)', // Sky blue
    'hsl(320, 70%, 45%)', // Magenta
    'hsl(180, 70%, 40%)', // Cyan
  ];

  return contrastColors[index % contrastColors.length];
}

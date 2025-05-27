import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fetches JSON data from GitHub Pages
 * @param path - The path to the JSON file relative to the repository root
 * @returns The parsed JSON data
 */
export async function fetchGithubJson<T>(path: string): Promise<T> {
  const baseUrl = 'https://raw.githubusercontent.com/emilkaiser/cal/refs/heads/main';
  const response = await fetch(`${baseUrl}/${path}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Utility functions for performance measurement and optimization
 */

/**
 * Memoizes a function to avoid recalculating the same result
 * @param fn The function to memoize
 * @returns A memoized version of the function
 */
export function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new Map<T, R>();

  return (arg: T) => {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    }

    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

/**
 * Measures the execution time of a function
 * @param name A name for this measurement
 * @param fn The function to measure
 * @returns The result of the function
 */
export function measureTime<T>(name: string, fn: () => T): T {
  console.time(name);
  const result = fn();
  console.timeEnd(name);
  return result;
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked
 * @param fn The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      fn(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

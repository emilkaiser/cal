"use strict";
/**
 * Utility functions for performance measurement and optimization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoize = memoize;
exports.measureTime = measureTime;
exports.debounce = debounce;
/**
 * Memoizes a function to avoid recalculating the same result
 * @param fn The function to memoize
 * @returns A memoized version of the function
 */
function memoize(fn) {
    const cache = new Map();
    return (arg) => {
        if (cache.has(arg)) {
            return cache.get(arg);
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
function measureTime(name, fn) {
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
function debounce(fn, wait) {
    let timeout = null;
    return function (...args) {
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

/**
 * useDebounce.ts
 * * Custom hook for debouncing values to optimize performance
 * * Reduces unnecessary API calls and re-renders
 * ! IMPORTANT: Essential for search and filter input optimization
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * * Hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // * Set up the timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // * Clean up the timeout if value changes (or on unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * * Hook that provides a debounced callback function
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @param dependencies - Optional dependency array for the callback
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500,
  dependencies?: React.DependencyList
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // * Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, dependencies || [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // * Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // * Set new timeout
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  // * Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * * Hook for debounced search input
 * Provides both immediate and debounced values for responsive UI
 */
export function useSearchDebounce(initialValue: string = '', delay: number = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  // * Set searching state when values differ
  useEffect(() => {
    setIsSearching(searchTerm !== debouncedSearchTerm);
  }, [searchTerm, debouncedSearchTerm]);

  return {
    searchTerm,           // * Immediate value for input display
    debouncedSearchTerm,  // * Debounced value for API calls
    setSearchTerm,        // * Update function
    isSearching,          // * Loading state
  };
}

/**
 * * Hook for debounced filter updates
 * Optimized for complex filter objects
 */
export function useFilterDebounce<T extends object>(
  initialFilters: T,
  delay: number = 500
) {
  const [filters, setFilters] = useState<T>(initialFilters);
  const [isPending, setIsPending] = useState(false);
  const debouncedFilters = useDebounce(filters, delay);

  // * Track pending state
  useEffect(() => {
    setIsPending(JSON.stringify(filters) !== JSON.stringify(debouncedFilters));
  }, [filters, debouncedFilters]);

  // * Update individual filter
  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // * Reset filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,            // * Immediate filters for UI
    debouncedFilters,   // * Debounced filters for queries
    updateFilter,       // * Update function
    resetFilters,       // * Reset function
    isPending,          // * Loading state
  };
}

/**
 * * Hook for throttled updates (different from debounce)
 * Ensures updates happen at most once per interval
 */
export function useThrottle<T>(value: T, interval: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;

    if (timeSinceLastUpdate >= interval) {
      // * Update immediately if enough time has passed
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      // * Schedule update for later
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - timeSinceLastUpdate);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, interval]);

  return throttledValue;
}

export default useDebounce;
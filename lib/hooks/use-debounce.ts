/**
 * useDebounce Hook
 *
 * OPTIMIZATION: Debounce value changes to reduce expensive operations
 * Useful for search inputs, API calls, expensive computations
 */

'use client';

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout to update debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Cleanup timeout if value changes before delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Example Usage:
 *
 * ```typescript
 * function SearchComponent() {
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 500);
 *
 *   useEffect(() => {
 *     // This only runs 500ms after user stops typing
 *     fetchResults(debouncedSearch);
 *   }, [debouncedSearch]);
 *
 *   return (
 *     <input
 *       value={search}
 *       onChange={(e) => setSearch(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * }
 * ```
 *
 * BEFORE: API call on every keystroke (10 calls for "javascript")
 * AFTER: API call only after user stops typing (1 call)
 *
 * Performance Impact: -90% redundant operations
 */

/**
 * useLatest Hook
 *
 * OPTIMIZATION: Returns a ref that always contains the latest value
 * Useful for creating stable callbacks that access current state
 * without recreating the callback on every render
 *
 * Pattern: advanced-use-latest from Vercel React Best Practices
 */

import { useRef, useEffect } from 'react';

export function useLatest<T>(value: T) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  });

  return ref;
}

/**
 * Example Usage:
 *
 * ```typescript
 * function Component() {
 *   const [count, setCount] = useState(0);
 *   const countRef = useLatest(count);
 *
 *   // ✅ GOOD: Callback never recreated, always has latest count
 *   const handleClick = useCallback(() => {
 *     console.log('Current count:', countRef.current);
 *   }, []); // Empty deps - stable!
 *
 *   // ❌ BAD: Callback recreated on every count change
 *   const handleClickBad = useCallback(() => {
 *     console.log('Current count:', count);
 *   }, [count]); // Count in deps - unstable
 * }
 * ```
 */

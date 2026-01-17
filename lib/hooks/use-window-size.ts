/**
 * useWindowSize Hook
 *
 * OPTIMIZATION: Deduplicated global event listener for window resize
 * Pattern: client-event-listeners from Vercel React Best Practices
 *
 * Instead of every component adding its own resize listener,
 * this hook shares a single listener across all consumers
 */

'use client';

import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

// Shared state across all hook instances
let listeners: Set<(size: WindowSize) => void> = new Set();
let currentSize: WindowSize = {
  width: typeof window !== 'undefined' ? window.innerWidth : 0,
  height: typeof window !== 'undefined' ? window.innerHeight : 0,
};

// Single global listener
const handleResize = () => {
  const newSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Only update if size actually changed
  if (newSize.width !== currentSize.width || newSize.height !== currentSize.height) {
    currentSize = newSize;
    listeners.forEach(listener => listener(newSize));
  }
};

// Attach listener only once
if (typeof window !== 'undefined' && listeners.size === 0) {
  window.addEventListener('resize', handleResize, { passive: true });
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(currentSize);

  useEffect(() => {
    // Add this component's listener
    listeners.add(setSize);

    // Cleanup on unmount
    return () => {
      listeners.delete(setSize);
    };
  }, []);

  return size;
}

/**
 * Example Usage:
 *
 * ```typescript
 * function Component() {
 *   const { width, height } = useWindowSize();
 *
 *   const isMobile = width < 768;
 *
 *   return (
 *     <div>
 *       {isMobile ? <MobileNav /> : <DesktopNav />}
 *     </div>
 *   );
 * }
 * ```
 *
 * BEFORE: If 10 components use window.innerWidth, you have 10 listeners
 * AFTER: With this hook, you have 1 shared listener
 *
 * Performance Impact: -90% resize event handlers
 */

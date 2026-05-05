import { useState, useEffect } from 'react';

// Global variable to track mouse movement
let hasMouseMoved = false;
const listeners: ((moved: boolean) => void)[] = [];

export function useMouseMoved() {
  const [moved, setMoved] = useState(hasMouseMoved);

  useEffect(() => {
    const handler = () => {
      if (!hasMouseMoved) {
        hasMouseMoved = true;
        // Notify all components using the hook
        listeners.forEach((cb) => cb(true));
      }
    };

    // Only add listener once globally
    if (listeners.length === 0) {
      window.addEventListener('mousemove', handler, { once: true });
    }

    // Add this component's listener
    const listener = (moved: boolean) => setMoved(moved);
    listeners.push(listener);

    // Clean up on unmount
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return moved;
}

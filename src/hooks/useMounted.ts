// src/hooks/useMounted.ts
import { useState, useEffect } from 'react';

/**
 * A hook that returns true once the component has mounted on the client.
 * This is useful to prevent hydration errors by ensuring that client-only
 * UI is not rendered on the server or during the initial client render.
 */
export const useMounted = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};
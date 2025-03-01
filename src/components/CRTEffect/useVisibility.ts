import { useState, useEffect } from 'react';

/**
 * Custom hook to track document visibility for pausing effects when tab is not visible
 * This helps improve performance by not rendering when not needed
 */
export const useVisibility = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Function to handle visibility change
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    // Add event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};

export default useVisibility;

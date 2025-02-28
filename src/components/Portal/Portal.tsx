import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
}

/**
 * Portal component that allows rendering children outside the normal DOM hierarchy
 * This is useful for overlays, modals, and animations that need to break out of parent containers
 */
const Portal: React.FC<PortalProps> = ({ children }) => {
  const [container] = useState(() => {
    const div = document.createElement('div');
    div.id = 'animation-portal-container';
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.pointerEvents = 'none';
    div.style.zIndex = '1000';
    return div;
  });

  useEffect(() => {
    // Add portal container to body
    document.body.appendChild(container);
    console.log('Portal: container mounted to DOM with ID', container.id);
    
    // Clean up when component unmounts
    return () => {
      document.body.removeChild(container);
      console.log('Portal: container removed from DOM');
    };
  }, [container]);

  return createPortal(children, container);
};

export default Portal;

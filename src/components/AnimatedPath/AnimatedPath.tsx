import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import './AnimatedPath.css';

interface AnimatedPathProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  value: string;
  onAnimationComplete: () => void;
  onComplete?: () => void; // Optional callback for parent component
}

/**
 * AnimatedPath component that creates a visual animation of a letter/number
 * moving from its original position to a target position (like a group box)
 */
const AnimatedPath: React.FC<AnimatedPathProps> = ({
  startX,
  startY,
  endX,
  endY,
  value,
  onAnimationComplete,
  onComplete
}) => {
  useEffect(() => {
    console.log(`AnimatedPath: Animating value ${value} from (${startX}, ${startY}) to (${endX}, ${endY})`);
  }, [startX, startY, endX, endY, value]);

  // Calculate path length for animation timing
  const pathLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const duration = 0.8 + (pathLength / 3000); // Longer paths take slightly more time

  // Random rotation for a more dynamic feel
  const initialRotation = Math.random() * 10 - 5;

  return (
    <motion.div
      className="animated-path-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transformOrigin: 'center center',
      }}
      initial={{ 
        x: startX, 
        y: startY,
        scale: 1.8,
        opacity: 1,
        rotate: initialRotation
      }}
      animate={{ 
        x: endX,
        y: endY,
        scale: 1,
        opacity: 1,
        rotate: 0
      }}
      exit={{ opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 0.8,
        duration: duration,
        ease: "easeOut"
      }}
      onAnimationComplete={() => {
        console.log(`AnimatedPath: Animation complete for value ${value}`);
        // Call the optional onComplete callback if provided
        if (onComplete) {
          onComplete();
        }
        // Always call the onAnimationComplete handler to remove this animation
        onAnimationComplete();
      }}
    >
      <motion.span 
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#64c8ff',
          textShadow: '0 0 5px rgba(100, 200, 255, 0.6), 0 0 10px rgba(100, 200, 255, 0.4)',
          fontFamily: 'Courier New, monospace'
        }}
        animate={{
          scale: 1.05,
          textShadow: '0 0 10px rgba(100, 200, 255, 0.8), 0 0 20px rgba(100, 200, 255, 0.6)'
        }}
        transition={{
          scale: {
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          },
          textShadow: {
            duration: 1.2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }
        }}
      >
        {value}
      </motion.span>
    </motion.div>
  );
};

export default AnimatedPath;

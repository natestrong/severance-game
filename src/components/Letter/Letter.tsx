import React, { useMemo, useEffect, useRef, useState } from 'react';
import './Letter.css';

interface LetterProps {
  value: string;
  row: number;
  col: number;
  isScary: boolean;
  isSelected: boolean;
  isRevealed: boolean;
  isRoot: boolean;
  isCenter: boolean;
  cellSize: number;
  onClick: () => void;
}

// Random number generator within a range
const randomInRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// Random integer within a range (inclusive)
const randomIntInRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate animation parameters based on letter characteristics
const generateAnimationParams = (row: number, col: number, isScary: boolean, isRevealed: boolean) => {
  // Use deterministic but seemingly random parameters based on position
  // This creates a unique but consistent initial state for each letter
  const seed = (row * 17 + col * 31) % 100;
  
  // Base magnitude of the shake (how far it moves)
  let baseMagnitude: number;
  if (seed < 10) {
    baseMagnitude = randomInRange(0.5, 1.2); // Microscopic shake
  } else if (seed < 30) {
    baseMagnitude = randomInRange(1.2, 2.5); // Tiny shake
  } else if (seed < 60) {
    baseMagnitude = randomInRange(2.5, 4.0); // Small shake
  } else if (seed < 85) {
    baseMagnitude = randomInRange(4.0, 6.0); // Medium shake
  } else {
    baseMagnitude = randomInRange(6.0, 9.0); // Large shake
  }
  
  // Base speed (duration in seconds) - higher number = slower animation
  const baseSpeed = randomInRange(4.0, 8.0);
  
  // Add slight variation for x and y magnitudes
  const magnitudeX = baseMagnitude * randomInRange(0.8, 1.2);
  const magnitudeY = baseMagnitude * randomInRange(0.8, 1.2);
  
  // Generate a random initial phase (0-1) to ensure letters don't all start at same position
  const initialPhase = Math.random();
  
  // Generate random direction changes for more organic movement
  const directionChanges = randomIntInRange(3, 6);
  
  // Determine if this letter should have the jitter effect (only scary or revealed)
  const hasJitter = isScary || isRevealed;
  
  return {
    magnitudeX,
    magnitudeY,
    speed: baseSpeed,
    initialPhase,
    directionChanges,
    hasJitter
  };
};

// Use custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (prevProps: LetterProps, nextProps: LetterProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.value === nextProps.value &&
    prevProps.isScary === nextProps.isScary &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isRevealed === nextProps.isRevealed &&
    prevProps.isRoot === nextProps.isRoot &&
    prevProps.isCenter === nextProps.isCenter &&
    prevProps.cellSize === nextProps.cellSize
    // We intentionally don't compare onClick to allow parent to reuse the same function
  );
};

const Letter: React.FC<LetterProps> = (props) => {
  const {
    value,
    row,
    col,
    isScary,
    isSelected,
    isRevealed,
    isRoot,
    isCenter,
    cellSize,
    onClick
  } = props;

  // For cells that are revealed but not selected, we want to give them the scary appearance
  const isRevealedScary = isRevealed && !isSelected;

  // Reference to the letter element for direct manipulation
  const letterRef = useRef<HTMLDivElement>(null);
  
  // Store animation parameters in state so they persist between renders
  const [animationParams] = useState(() => 
    generateAnimationParams(row, col, isScary, isRevealedScary)
  );
  
  // Store multipliers that will slowly change over time
  const [multipliers, setMultipliers] = useState({
    speed: randomInRange(0.8, 1.2),  
    magnitude: randomInRange(0.8, 1.2)
  });
  
  // Animation frame ID for cleanup
  const animationFrameId = useRef<number | null>(null);
  
  // Get the current timestamp for animation
  const startTime = useRef(Date.now());
  const lastMultiplierUpdate = useRef(Date.now());
  
  // Main animation function using requestAnimationFrame
  useEffect(() => {
    if (isSelected) return; // Don't animate selected letters
    
    const { magnitudeX, magnitudeY, speed, initialPhase, directionChanges } = animationParams;
    
    const animate = () => {
      if (!letterRef.current) return;
      
      const now = Date.now();
      const elapsed = (now - startTime.current) / 1000; // in seconds
      
      // Update multipliers slowly over time (roughly every 3 seconds)
      if (now - lastMultiplierUpdate.current > 3000) {
        lastMultiplierUpdate.current = now;
        
        // Smoothly transition to new values
        setMultipliers(prev => ({
          speed: prev.speed + randomInRange(-0.05, 0.05),  // Small adjustments
          magnitude: prev.magnitude + randomInRange(-0.05, 0.05)
        }));
        
        // Keep values in reasonable ranges
        if (multipliers.speed < 0.6) setMultipliers(prev => ({ ...prev, speed: 0.6 }));
        if (multipliers.speed > 1.4) setMultipliers(prev => ({ ...prev, speed: 1.4 }));
        if (multipliers.magnitude < 0.6) setMultipliers(prev => ({ ...prev, magnitude: 0.6 }));
        if (multipliers.magnitude > 1.4) setMultipliers(prev => ({ ...prev, magnitude: 1.4 }));
      }
      
      // Apply current multipliers to base values
      const currentMagnitudeX = magnitudeX * multipliers.magnitude;
      const currentMagnitudeY = magnitudeY * multipliers.magnitude;
      const currentSpeed = speed / multipliers.speed; // Inverted because lower = faster
      
      // Complex wave function for more natural movement
      // Use multiple sine waves with different frequencies and phase shifts
      const t = (elapsed / currentSpeed) + initialPhase; // Apply initial phase offset
      
      // Create multiple wave components with different frequencies and phases
      let dx = 0, dy = 0;
      
      // Use different frequencies and phases for more chaotic motion
      for (let i = 1; i <= directionChanges; i++) {
        const freq = i * 0.5; // Different frequency for each component
        const phaseX = i * 0.7; // Different phase for X
        const phaseY = i * 0.3; // Different phase for Y
        
        dx += Math.sin(t * freq * Math.PI * 2 + phaseX) * (currentMagnitudeX / i);
        dy += Math.cos(t * freq * Math.PI * 2 + phaseY) * (currentMagnitudeY / i);
      }
      
      // Apply the transform directly to the content div to allow the jitter to be applied separately
      letterRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      
      // Continue the animation
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    // Start the animation
    animationFrameId.current = requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [animationParams, isSelected, multipliers]);
  
  // Only apply jitter to scary cells that aren't selected
  const shouldApplyJitter = animationParams.hasJitter && !isSelected;
  
  // Create a unique key using row and col that will persist between renders
  const animationKey = `letter-${row}-${col}`;
  
  return (
    <div 
      className={`
        letter-cell
        ${isCenter ? 'center-cell' : ''} 
        ${isScary ? 'scary-cell' : ''}
        ${isSelected ? 'selected-cell' : ''}
        ${isRevealedScary ? 'revealed-cell' : ''}
      `}
      onClick={onClick}
      data-is-scary={isScary}
      data-is-selected={isSelected}
      data-is-revealed={isRevealed}
      data-is-root={isRoot}
      style={{
        top: `${row * cellSize}px`,
        left: `${col * cellSize}px`,
        width: `${cellSize}px`,
        height: `${cellSize}px`,
      }}
      key={animationKey}
    >
      <div 
        className="cell-content"
        ref={letterRef}
      >
        {shouldApplyJitter ? (
          <span className="jitter">{value}</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
};

// Use React.memo with custom comparison function to prevent unnecessary re-renders
export default React.memo(Letter, arePropsEqual);

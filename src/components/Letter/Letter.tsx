import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { createNoise2D } from 'simplex-noise';
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
  isCounted?: boolean;
  isAnimating?: boolean;
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
  
  // Base magnitude of the shake (how far it moves) - between 2px and 30px (increased by 10px)
  let baseMagnitude: number;
  if (seed < 10) {
    baseMagnitude = randomInRange(2, 15); // Small shake
  } else if (seed < 30) {
    baseMagnitude = randomInRange(15, 18); // Medium-small shake
  } else if (seed < 60) {
    baseMagnitude = randomInRange(18, 22); // Medium shake
  } else if (seed < 85) {
    baseMagnitude = randomInRange(22, 26); // Medium-large shake
  } else {
    baseMagnitude = randomInRange(26, 30); // Large shake
  }
  
  // Random zoom duration between 0.2 and 0.6 seconds
  const zoomDuration = randomInRange(0.2, 0.6);
  
  // Create unique offsets for each letter to ensure different movement patterns
  const offsetX = Math.random() * 1000;
  const offsetY = Math.random() * 1000;
  
  // Fast spike parameters
  const spikeFrequency = randomInRange(0.001, 0.005); // Less frequent fast spikes
  const spikeIntensity = randomInRange(2.0, 3.5); // Fast spike intensity
  const spikeDuration = randomInRange(0.05, 0.2); // Short duration for fast spikes
  
  // Medium speed shake parameters - occurs between base and spike speeds
  const mediumShakeFrequency = randomInRange(0.002, 0.01); // Twice as likely as spikes
  const mediumShakeIntensity = randomInRange(1.5, 2.5); // Less intense than fast spikes
  const mediumShakeDuration = randomInRange(0.3, 0.8); // Longer duration than spikes
  
  // Determine if this letter should have the jitter effect (only scary or revealed)
  const hasJitter = isScary || isRevealed;
  
  return {
    magnitude: baseMagnitude,
    zoomDuration,
    offsetX,
    offsetY,
    spikeFrequency,
    spikeIntensity,
    spikeDuration,
    mediumShakeFrequency,
    mediumShakeIntensity,
    mediumShakeDuration,
    hasJitter
  };
};

// Use custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (prevProps: LetterProps, nextProps: LetterProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.row === nextProps.row &&
    prevProps.col === nextProps.col &&
    prevProps.isScary === nextProps.isScary &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isRevealed === nextProps.isRevealed &&
    prevProps.isRoot === nextProps.isRoot &&
    prevProps.isCenter === nextProps.isCenter &&
    prevProps.isCounted === nextProps.isCounted &&
    prevProps.isAnimating === nextProps.isAnimating &&
    prevProps.cellSize === nextProps.cellSize
    // We intentionally don't compare onClick to allow parent to reuse the same function
  );
};

// Create a noise generator that persists across renders
// We use one global instance to avoid recreating it for each letter
let noiseGenerator: ReturnType<typeof createNoise2D>;
try {
  noiseGenerator = createNoise2D();
} catch (e) {
  // Fallback if noise generator fails
  noiseGenerator = (x: number, y: number) => Math.sin(x) * Math.cos(y);
}

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
    isCounted = false,
    isAnimating = false,
    cellSize,
    onClick
  } = props;

  // For cells that are revealed but not selected, we want to give them the scary appearance
  const isRevealedScary = isRevealed && !isSelected;
  
  // Store animation parameters in state so they persist between renders
  const [animationParams] = useState(() => 
    generateAnimationParams(row, col, isScary, isRevealedScary)
  );
  
  // Apply jitter to scary cells that aren't selected
  // This includes both original scary cells and revealed scary neighbors
  const shouldApplyJitter = (isScary || isRevealedScary) && !isSelected;

  // Create a unique key using row and col that will persist between renders
  const animationKey = `letter-${row}-${col}`;
  
  // Use this same key as the element ID for DOM targeting
  const elementId = `letter-cell-${row}-${col}`;

  // Create motion values for the slow random shake
  const slowX = useMotionValue(0);
  const slowY = useMotionValue(0);
  
  // Create additional motion values for the scary jitter effect
  const jitterX = useMotionValue(0);
  const jitterY = useMotionValue(0);
  
  // Combine slow shake and jitter for the final transform
  // Now both effects will be applied to scary numbers
  const x = useTransform([slowX, jitterX], ([sX, jX]) => sX + (shouldApplyJitter ? jX : 0));
  const y = useTransform([slowY, jitterY], ([sY, jY]) => sY + (shouldApplyJitter ? jY : 0));
  
  // Reference to track animation frame
  const animationFrameRef = useRef<number | null>(null);
  
  // Setup the slow random shake animation with noise - applied to ALL numbers
  useEffect(() => {
    if (isSelected) return;
    
    const { 
      magnitude, offsetX, offsetY, 
      spikeFrequency, spikeIntensity, spikeDuration,
      mediumShakeFrequency, mediumShakeIntensity, mediumShakeDuration
    } = animationParams;
    
    // Use simplex noise to create smooth random movement
    let time = 0;
    
    // Track spike state
    let isSpikingNow = false;
    let spikeStartTime = 0;
    let spikeValue = 1.0; // Multiplier for magnitude during spikes
    
    // Track medium shake state
    let isMediumShaking = false;
    let mediumShakeStartTime = 0;
    let mediumShakeValue = 1.0; // Multiplier for medium shakes
    
    let lastEffectCheck = 0;
    
    // Each letter has its own effect timing to avoid all letters changing at once
    const effectCheckInterval = randomInRange(1.0, 2.5); // Check for effect changes
    
    const animate = () => {
      // Increment time very slowly but slightly faster than before
      time += 0.001; // 2x faster than before for more responsiveness
      
      // Manage animation state changes
      const currentTime = performance.now() / 1000; // Current time in seconds
      
      // Check if we should create a new effect (spike or medium shake)
      if (currentTime - lastEffectCheck > effectCheckInterval) {
        lastEffectCheck = currentTime;
        
        // Only check for new effects if we're not currently in an effect
        if (!isSpikingNow && !isMediumShaking) {
          // First try for a spike (less frequent)
          if (Math.random() < spikeFrequency) {
            isSpikingNow = true;
            spikeStartTime = currentTime;
            spikeValue = spikeIntensity;
          } 
          // If no spike, try for a medium shake (more frequent)
          else if (Math.random() < mediumShakeFrequency) {
            isMediumShaking = true;
            mediumShakeStartTime = currentTime;
            mediumShakeValue = mediumShakeIntensity;
          }
        }
      }
      
      // If a spike is in progress, manage its lifecycle
      if (isSpikingNow) {
        const spikeElapsed = currentTime - spikeStartTime;
        
        // If spike duration is over, start fading it out
        if (spikeElapsed > spikeDuration) {
          // Fade out quickly for snappier transitions
          spikeValue = Math.max(1.0, spikeIntensity - (spikeElapsed - spikeDuration) * 4);
          
          // End the spike when it fades back to normal
          if (spikeValue <= 1.0) {
            isSpikingNow = false;
            spikeValue = 1.0;
          }
        }
      }
      
      // If a medium shake is in progress, manage its lifecycle
      if (isMediumShaking) {
        const mediumElapsed = currentTime - mediumShakeStartTime;
        
        // If medium shake duration is over, start fading it out
        if (mediumElapsed > mediumShakeDuration) {
          // Fade out more gradually than spikes
          mediumShakeValue = Math.max(1.0, mediumShakeIntensity - (mediumElapsed - mediumShakeDuration) * 2);
          
          // End the medium shake when it fades back to normal
          if (mediumShakeValue <= 1.0) {
            isMediumShaking = false;
            mediumShakeValue = 1.0;
          }
        }
      }
      
      // Get base noise values between -1 and 1 for x and y
      // Using different offsets ensures unique patterns for each letter
      let noiseX = noiseGenerator(time + offsetX, 0);
      let noiseY = noiseGenerator(0, time + offsetY);
      
      // Apply current effect multipliers (spike takes precedence over medium if both active)
      let effectMultiplier = 1.0;
      let frequencyMultiplier = 1.0;
      
      if (isSpikingNow) {
        // Fast spike effect - high frequency noise
        effectMultiplier = spikeValue;
        frequencyMultiplier = 15; // High frequency for quick movements
      } else if (isMediumShaking) {
        // Medium shake effect - medium frequency noise
        effectMultiplier = mediumShakeValue;
        frequencyMultiplier = 5; // Medium frequency for moderate movements
      }
      
      // Apply additional frequency-specific noise during effects
      if (effectMultiplier > 1.0) {
        // Add effect-specific noise component
        const effectNoiseX = noiseGenerator((time * frequencyMultiplier) + offsetX, 0) * (effectMultiplier - 1.0);
        const effectNoiseY = noiseGenerator(0, (time * frequencyMultiplier) + offsetY) * (effectMultiplier - 1.0);
        
        // Blend the effect noise with the regular noise
        noiseX = noiseX * effectMultiplier + effectNoiseX;
        noiseY = noiseY * effectMultiplier + effectNoiseY;
      }
      
      // Scale noise by magnitude
      slowX.set(noiseX * magnitude);
      slowY.set(noiseY * magnitude);
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSelected, animationParams, slowX, slowY]);
  
  // Setup the scary jitter animation - only for scary numbers
  useEffect(() => {
    if (!shouldApplyJitter) return;
    
    let jitterTime = 0;
    
    const animateJitter = () => {
      // Increment time for jitter animation (purposely faster to create distinct jittery effect)
      jitterTime += 0.1;
      
      // Use different noise fields for jitter to create rapid, sharp movements
      // Using high-frequency noise creates more erratic movement
      const noiseJitterX = noiseGenerator(jitterTime * 5, 0) * 3;
      const noiseJitterY = noiseGenerator(0, jitterTime * 5) * 3;
      
      jitterX.set(noiseJitterX);
      jitterY.set(noiseJitterY);
      
      requestAnimationFrame(animateJitter);
    };
    
    const jitterFrameId = requestAnimationFrame(animateJitter);
    
    return () => cancelAnimationFrame(jitterFrameId);
  }, [shouldApplyJitter, jitterX, jitterY]);

  // Framer Motion animation variants
  const letterVariants = {
    normal: { 
      scale: 1,
      opacity: 1
    },
    selected: { 
      scale: 2.2, 
      opacity: 1,
      x: 0, // Reset any shake/jitter when selected
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: animationParams.zoomDuration * 10, // Slow down animation by a factor of 10
      }
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.2 * 10 // Slow down animation by a factor of 10
      }
    },
    animating: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.1 * 10 // Slow down animation by a factor of 10
      }
    }
  };

  // Determine the current animation state
  const animationState = isAnimating 
    ? 'animating' 
    : isSelected || isCounted 
      ? 'selected' 
      : 'normal';
  
  // If this is a counted cell that's not actively animating, don't render anything
  if (isCounted && !isAnimating) {
    return null;
  }
  
  // If the letter is currently animating, don't show it in the grid at all
  // The animation will be handled by the AnimationContainer component
  if (isAnimating) {
    return null; // Don't render anything when animating - let the AnimationContainer handle it
  }
  
  return (
    <div 
      className={`
        letter-cell
        ${isCenter ? 'center-cell' : ''} 
        ${isScary ? 'scary-cell' : ''}
        ${isSelected ? 'selected-cell' : ''}
        ${isRevealedScary ? 'revealed-cell' : ''}
      `}
      id={elementId}
      data-row={row}
      data-col={col}
      onClick={isAnimating ? undefined : onClick}
      data-is-scary={isScary}
      data-is-selected={isSelected}
      data-is-revealed={isRevealed}
      data-is-root={isRoot}
      style={{
        top: `${row * cellSize}px`,
        left: `${col * cellSize}px`,
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        backgroundColor: 'transparent',
        border: 'none',
        pointerEvents: isAnimating ? 'none' : 'auto' // Disable interaction during animation
      }}
    >
      <AnimatePresence>
        <motion.div 
          className="cell-content"
          key={animationKey}
          initial="normal"
          animate={animationState}
          exit="exit"
          variants={letterVariants}
          style={{ x, y }}
          layout
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Use React.memo with custom comparison function to prevent unnecessary re-renders
export default React.memo(Letter, arePropsEqual);

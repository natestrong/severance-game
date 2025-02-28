import React, { useMemo } from 'react';
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

// Helper function to maintain consistent shake parameters based on position
const generateShakeParams = (row: number, col: number, isScary: boolean, isRevealed: boolean): {
  intensity: string;
  delay: string;
  hasJitter: boolean;
} => {
  // Use deterministic but seemingly random shake intensity based on position
  const posHash = (row * 17 + col * 31) % 100;
  
  // Distribute shake intensities with a bias towards more shake
  let intensity = '';
  if (posHash < 10) {
    intensity = 'shake-microscopic'; // 10% chance of microscopic shake
  } else if (posHash < 30) {
    intensity = 'shake-tiny'; // 20% chance of tiny shake
  } else if (posHash < 60) {
    intensity = 'shake-small'; // 30% chance of small shake
  } else if (posHash < 85) {
    intensity = 'shake-medium'; // 25% chance of medium shake
  } else {
    intensity = 'shake-large'; // 15% chance of large shake
  }
  
  // Apply delay based on position to make the shake feel more natural
  const delayHash = (row * 13 + col * 29) % 20;
  const delay = `delay-${delayHash}`;

  // Determine if this cell should have the jitter effect
  // Only scary numbers (original or revealed) have jitter
  const hasJitter = isScary || isRevealed;
  
  return { intensity, delay, hasJitter };
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
  
  // Use memoized shake parameters to prevent regeneration on re-renders
  const shakeParams = useMemo(() => {
    return generateShakeParams(row, col, isScary, isRevealedScary);
  }, [row, col, isScary, isRevealedScary]);
  
  const { intensity, delay, hasJitter } = shakeParams;
  
  // Only apply jitter to scary cells that aren't selected
  const shouldApplyJitter = hasJitter && !isSelected;
  
  // Create a unique key using row and col that will persist between renders
  const animationKey = `letter-${row}-${col}`;
  
  return (
    <div 
      className={`
        letter-cell
        ${isCenter ? 'center-cell' : ''} 
        ${intensity} ${delay}
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
      <div className="cell-content">
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

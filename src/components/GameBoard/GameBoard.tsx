import React, { useMemo, useRef, useEffect, useState } from 'react';
import './GameBoard.css';

interface GameBoardProps {
  gridSize?: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ gridSize = 100 }) => {
  // Calculate the exact center cell index
  const centerCellRowIndex = Math.floor(gridSize / 2);
  const centerCellColIndex = Math.floor(gridSize / 2);
  const centerCellIndex = (centerCellRowIndex * gridSize) + centerCellColIndex;
  
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Function to generate random shake parameters for a cell
  const generateShakeParams = () => {
    // Define intensity options with weighted distribution
    // This makes tiny/small shakes more common and larger shakes less common
    const intensities = [
      'shake-tiny', 'shake-tiny', 'shake-tiny', // 3x weight for tiny (hard to perceive)
      'shake-very-small', 'shake-very-small', 'shake-very-small', // 3x weight for very small
      'shake-small', 'shake-small', // 2x weight for small
      'shake-medium', 'shake-medium', // 2x weight for medium
      'shake-large', // 1x weight for large
      'shake-extra-large', // 1x weight for extra-large (rare)
    ];
    
    const intensity = intensities[Math.floor(Math.random() * intensities.length)];
    
    // Randomly select delay class with more options
    const delays = ['delay-0', 'delay-1', 'delay-2', 'delay-3', 'delay-4', 'delay-5', 'delay-6'];
    const delay = delays[Math.floor(Math.random() * delays.length)];
    
    return {
      intensity,
      delay
    };
  };
  
  // Generate a fixed grid of random numbers
  // This will be memoized to prevent unnecessary recalculations
  const gridCells = useMemo(() => {
    const cells = [];
    const totalCells = gridSize * gridSize;
    
    for (let i = 0; i < totalCells; i++) {
      // Calculate row and column for positioning
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      // Highlight the center cell to make it clear we're in the middle
      const isCenter = i === centerCellIndex;
      cells.push({
        value: Math.floor(Math.random() * 10),
        isCenter,
        shakeParams: generateShakeParams(),
        position: { row, col }
      });
    }
    
    return cells;
  }, [gridSize, centerCellIndex]);

  return (
    <div className="gameboard">
      <div className="game-content">
        <div 
          className="number-grid"
          ref={gridRef}
        >
          {gridCells.map((cell, index) => {
            const { intensity, delay } = cell.shakeParams;
            
            return (
              <div 
                key={`cell-${index}`} 
                className={`grid-cell ${cell.isCenter ? 'center-cell' : ''} ${intensity} ${delay}`}
              >
                {cell.value}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
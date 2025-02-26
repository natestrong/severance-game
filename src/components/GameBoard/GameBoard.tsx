import React, { useMemo } from 'react';
import './GameBoard.css';

interface GameBoardProps {
  gridSize?: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ gridSize = 100 }) => {
  // Generate a fixed grid of random numbers
  // This will be memoized to prevent unnecessary recalculations
  const gridCells = useMemo(() => {
    const cells = [];
    const totalCells = gridSize * gridSize;
    
    for (let i = 0; i < totalCells; i++) {
      cells.push(Math.floor(Math.random() * 10));
    }
    
    return cells;
  }, [gridSize]);

  return (
    <div className="gameboard">
      <div className="game-content">
        <div className="number-grid">
          {gridCells.map((number, index) => (
            <div 
              key={`cell-${index}`} 
              className="grid-cell"
            >
              {number}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
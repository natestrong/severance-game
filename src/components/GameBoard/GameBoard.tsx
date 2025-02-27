import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useGameContext } from '../../context/GameContext';
import './GameBoard.css';

interface GameBoardProps {
  gridSize?: number;
  cellSize?: number; // Size in pixels for each cell
}

const GameBoard: React.FC<GameBoardProps> = ({ gridSize = 100, cellSize = 100 }) => {
  // Use the game context for grid management and scary numbers
  const { 
    grid, 
    initializeGrid, 
    selectScaryNumber, 
    revealScaryNeighbors 
  } = useGameContext();
  
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [visibleArea, setVisibleArea] = useState({
    startRow: 0,
    endRow: 0,
    startCol: 0,
    endCol: 0,
    scrollTop: 0,
    scrollLeft: 0,
    viewportWidth: 0,
    viewportHeight: 0
  });
  
  // Buffer zone - render additional rows/columns outside the visible area
  // Increase buffer for smoother scrolling experience
  const BUFFER_CELLS = 8;
  
  // Initialize the grid when component mounts
  useEffect(() => {
    console.log(`Initializing grid with size ${gridSize}`);
    initializeGrid(gridSize);
    // Only run this effect once on mount
  }, []);
  
  // Memoize the total grid dimensions
  const gridDimensions = useMemo(() => ({
    width: gridSize * cellSize,
    height: gridSize * cellSize
  }), [gridSize, cellSize]);
  
  // Calculate the exact center cell index for highlighting
  const centerIndices = useMemo(() => ({
    row: Math.floor(gridSize / 2),
    col: Math.floor(gridSize / 2)
  }), [gridSize]);

  // Update visible area calculation - optimized with useCallback for performance
  const updateVisibleArea = useCallback(() => {
    const container = gridContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollLeft, clientHeight, clientWidth } = container;
    
    // Calculate visible cell range with buffer
    const startRow = Math.max(0, Math.floor(scrollTop / cellSize) - BUFFER_CELLS);
    const endRow = Math.min(gridSize - 1, Math.ceil((scrollTop + clientHeight) / cellSize) + BUFFER_CELLS);
    
    const startCol = Math.max(0, Math.floor(scrollLeft / cellSize) - BUFFER_CELLS);
    const endCol = Math.min(gridSize - 1, Math.ceil((scrollLeft + clientWidth) / cellSize) + BUFFER_CELLS);
    
    setVisibleArea({
      startRow,
      endRow,
      startCol,
      endCol,
      scrollTop,
      scrollLeft,
      viewportWidth: clientWidth,
      viewportHeight: clientHeight
    });
  }, [cellSize, gridSize, BUFFER_CELLS]);

  // Set up scroll handler to update the visible area
  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;
    
    // Initial call to set visible area
    updateVisibleArea();
    
    // Use passive event listener for better scroll performance
    container.addEventListener('scroll', updateVisibleArea, { passive: true });
    
    // Scroll to the middle of the grid initially
    const scrollToMiddle = () => {
      const totalWidth = gridDimensions.width;
      const totalHeight = gridDimensions.height;
      
      container.scrollTo({
        left: (totalWidth - container.clientWidth) / 2,
        top: (totalHeight - container.clientHeight) / 2,
        behavior: 'auto'
      });
      
      // Update visible area after scrolling
      updateVisibleArea();
    };
    
    // Small delay to ensure container is properly sized
    setTimeout(scrollToMiddle, 100);
    
    // Also update visible area when window resizes
    const handleResize = () => {
      updateVisibleArea();
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', updateVisibleArea);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [gridDimensions, updateVisibleArea]);
  
  // Log grid changes for debugging
  useEffect(() => {
    // Count cells by state for debugging
    let scaryCount = 0;
    let selectedCount = 0;
    let revealedCount = 0;
    
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell.isScary) scaryCount++;
        if (cell.isSelected) selectedCount++;
        if (cell.isRevealed) revealedCount++;
      });
    });
    
    console.log(`Grid stats: ${scaryCount} scary, ${selectedCount} selected, ${revealedCount} revealed`);
    console.log(`Visible area: Rows ${visibleArea.startRow}-${visibleArea.endRow}, Cols ${visibleArea.startCol}-${visibleArea.endCol}`);
    console.log(`Rendering ${(visibleArea.endRow - visibleArea.startRow + 1) * (visibleArea.endCol - visibleArea.startCol + 1)} cells`);
  }, [grid, visibleArea]);
  
  // Function to generate random shake parameters for a cell - memoized by cell position
  const generateShakeParams = useCallback((row: number, col: number, isScary: boolean, isRevealed: boolean): { intensity: string, delay: string, hasJitter: boolean } => {
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
  }, []);

  // Handle cell click events - memoized for performance
  const handleCellClick = useCallback((row: number, col: number, isScary: boolean, isRoot: boolean) => {
    if (isScary) {
      console.log(`Clicked scary number at [${row}, ${col}], isRoot: ${isRoot}`);
      selectScaryNumber(row, col);
      
      // Only root scary numbers should reveal neighbors
      if (isRoot) {
        console.log(`Revealing neighbors for root scary number at [${row}, ${col}]`);
        revealScaryNeighbors(row, col);
      } else {
        console.log(`Not revealing neighbors for non-root scary number at [${row}, ${col}]`);
      }
    } else {
      console.log(`Clicked regular number at [${row}, ${col}]`);
    }
  }, [selectScaryNumber, revealScaryNeighbors]);

  // Create a reusable Cell component for better performance
  const Cell = useCallback(({ row, col, cell }: { row: number, col: number, cell: any }) => {
    // For cells that are revealed but not selected, we want to give them the scary appearance
    const isRevealedScary = cell.isRevealed && !cell.isSelected;
    
    // Get shake parameters based on whether the cell is scary or revealed
    const { intensity, delay, hasJitter } = generateShakeParams(row, col, cell.isScary, isRevealedScary);
    
    const isCenter = row === centerIndices.row && col === centerIndices.col;
    
    // Only apply jitter to scary cells that aren't selected
    // When selected, keep the normal shake but remove jitter
    const shouldApplyJitter = hasJitter && !cell.isSelected;
    
    return (
      <div 
        key={`${row}-${col}`}
        className={`
          grid-cell 
          ${isCenter ? 'center-cell' : ''} 
          ${intensity} ${delay}
          ${cell.isScary ? 'scary-cell' : ''}
          ${cell.isSelected ? 'selected-cell' : ''}
          ${isRevealedScary ? 'revealed-cell' : ''}
        `}
        onClick={() => handleCellClick(row, col, cell.isScary, cell.isRoot)}
        data-is-scary={cell.isScary}
        data-is-selected={cell.isSelected}
        data-is-revealed={cell.isRevealed}
        data-is-root={cell.isRoot}
        style={{
          top: `${row * cellSize}px`,
          left: `${col * cellSize}px`,
          width: `${cellSize}px`,
          height: `${cellSize}px`,
        }}
      >
        <div className="cell-content">
          {shouldApplyJitter ? (
            <span className="jitter">{cell.value}</span>
          ) : (
            cell.value
          )}
        </div>
      </div>
    );
  }, [cellSize, centerIndices, generateShakeParams, handleCellClick]);

  // Generate only the visible portion of cells
  const visibleCells = useMemo(() => {
    if (grid.length === 0) return null;
    
    const cells = [];
    const startTime = performance.now();
    
    // Optimize the loop to avoid excess calculations
    for (let row = visibleArea.startRow; row <= visibleArea.endRow; row++) {
      for (let col = visibleArea.startCol; col <= visibleArea.endCol; col++) {
        if (row < gridSize && col < gridSize && grid[row] && grid[row][col]) {
          cells.push(
            <Cell 
              key={`${row}-${col}`}
              row={row}
              col={col}
              cell={grid[row][col]}
            />
          );
        }
      }
    }
    
    const endTime = performance.now();
    console.log(`Cell rendering took ${endTime - startTime}ms`);
    
    return cells;
  }, [grid, visibleArea, gridSize, Cell]);

  return (
    <div className="gameboard">
      <div className="game-content">
        <div 
          className="number-grid-container"
          ref={gridContainerRef}
        >
          <div 
            className="number-grid"
            style={{
              width: `${gridDimensions.width}px`,
              height: `${gridDimensions.height}px`,
            }}
          >
            {visibleCells}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(GameBoard);
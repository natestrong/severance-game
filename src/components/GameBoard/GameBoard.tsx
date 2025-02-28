import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useGameContext } from '../../context/GameContext';
import Letter from '../Letter/Letter';
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
  const [isDragging, setIsDragging] = useState(false);
  const [lastSelectedCell, setLastSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasMouseMoved, setHasMouseMoved] = useState(false);
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
    
    // Mouse move handler - simplified without auto-scrolling
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to the container
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      
      // Update mouse position
      setMousePosition({ x: relativeX, y: relativeY });
      
      // Set flag that mouse has moved at least once
      if (!hasMouseMoved) {
        setHasMouseMoved(true);
      }
    };
    
    // Add mouse move listener
    container.addEventListener('mousemove', handleMouseMove);
    
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
        container.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [gridDimensions, updateVisibleArea, hasMouseMoved]);
  
  // Handle cell click events - memoized for performance
  const handleCellClick = useCallback((row: number, col: number, isScary: boolean, isRoot: boolean) => {
    console.log(`Cell clicked: [${row}, ${col}], isScary: ${isScary}, isRoot: ${isRoot}`);
    
    // DEBUG: Check if the cell.isRoot flag in the grid matches what we're receiving
    const cellInGrid = grid[row][col];
    console.log(`Grid cell state: isScary=${cellInGrid.isScary}, isRoot=${cellInGrid.isRoot}, isRevealed=${cellInGrid.isRevealed}, isSelected=${cellInGrid.isSelected}`);
    
    if (isScary) {
      console.log(`This is a scary cell, calling selectScaryNumber`);
      
      // Check if the cell is actually a root scary number in the grid
      const realIsRoot = cellInGrid.isRoot;
      console.log(`Using grid's isRoot value: ${realIsRoot}`);
      
      selectScaryNumber(row, col, realIsRoot);
      
      // Only root scary numbers should reveal neighbors
      if (realIsRoot) {
        console.log(`This is a ROOT scary cell, calling revealScaryNeighbors`);
        revealScaryNeighbors(row, col);
      }
    }
  }, [selectScaryNumber, revealScaryNeighbors, grid]);

  // Handle mouse events for drag selection
  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;
    
    const handleMouseDown = () => {
      setIsDragging(true);
      setLastSelectedCell(null);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setLastSelectedCell(null);
    };
    
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Mouse move handler for drag selection
  useEffect(() => {
    if (!isDragging || !gridContainerRef.current) return;
    
    const processDragOver = () => {
      const container = gridContainerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const relativeX = mousePosition.x;
      const relativeY = mousePosition.y;
      
      const scrollLeft = container.scrollLeft;
      const scrollTop = container.scrollTop;
      
      // Calculate which grid cell the mouse is over
      const col = Math.floor((relativeX + scrollLeft) / cellSize);
      const row = Math.floor((relativeY + scrollTop) / cellSize);
      
      // Check if this is a new cell (not the last one we processed)
      if (lastSelectedCell === null || lastSelectedCell.row !== row || lastSelectedCell.col !== col) {
        // Get the cell at this position if it's within bounds
        if (row >= 0 && row < gridDimensions.height && col >= 0 && col < gridDimensions.width) {
          const cell = grid[row][col];
          // Only select if it's a scary cell and not already selected
          if (cell && cell.isScary && !cell.isSelected && !cell.isCounted) {
            handleCellClick(row, col, true, cell.isRoot);
            setLastSelectedCell({ row, col });
          }
        }
      }
    };
    
    processDragOver();
  }, [isDragging, mousePosition, lastSelectedCell, grid, gridDimensions, cellSize, handleCellClick]);

  // Render all the visible Letters based on the visible area
  const visibleCells = useMemo(() => {
    if (grid.length === 0) return null;
    
    const cells = [];
    
    // Optimize the loop to avoid excess calculations
    for (let row = visibleArea.startRow; row <= visibleArea.endRow; row++) {
      for (let col = visibleArea.startCol; col <= visibleArea.endCol; col++) {
        if (row < gridSize && col < gridSize && grid[row] && grid[row][col]) {
          const cell = grid[row][col];
          const isCenter = row === centerIndices.row && col === centerIndices.col;
          
          cells.push(
            <Letter 
              key={`${row}-${col}`}
              value={cell.value}
              row={row}
              col={col}
              isScary={cell.isScary}
              isSelected={cell.isSelected}
              isRevealed={cell.isRevealed}
              isRoot={cell.isRoot}
              isCounted={cell.isCounted}
              isAnimating={cell.isAnimating}
              isCenter={isCenter}
              cellSize={cellSize}
              onClick={() => handleCellClick(row, col, cell.isScary, cell.isRoot)}
            />
          );
        }
      }
    }
    
    return cells;
  }, [grid, visibleArea, gridSize, cellSize, centerIndices, handleCellClick]);

  // Log grid changes for debugging - removing verbose logs
  useEffect(() => {
    // Only log occasionally to reduce console spam
    if (Math.random() > 0.05) return; // Only log ~5% of the time
    
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
  }, [grid, visibleArea]);

  return (
    <div className="gameboard">
      <div className="game-content">
        <div 
          className="number-grid-container"
          ref={gridContainerRef}
          style={{ 
            position: 'relative',
            height: 'calc(100vh - 60px)', 
            overflow: 'auto',
            cursor: isDragging ? 'grabbing' : 'auto'
          }}
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
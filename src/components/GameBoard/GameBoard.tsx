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
  // Animation frame ID for cleanup of auto-scrolling
  const autoScrollAnimationId = useRef<number | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  // Auto-scroll settings
  const EDGE_THRESHOLD = 200; // Distance from edge that triggers auto-scroll (in pixels)
  const MAX_SCROLL_SPEED = 35; // Maximum scroll speed in pixels per frame
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // Flag to track if mouse has moved at least once
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
    
    // Mouse move handler for auto-scrolling
    const handleMouseMove = (e: MouseEvent) => {
      // Get container bounds
      const rect = container.getBoundingClientRect();
      
      // Calculate mouse position relative to the container
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
      
      // Clean up auto-scroll animation if active
      if (autoScrollAnimationId.current !== null) {
        cancelAnimationFrame(autoScrollAnimationId.current);
      }
    };
  }, [gridDimensions, updateVisibleArea]);
  
  // Auto-scrolling effect when cursor approaches edges
  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container || !hasMouseMoved) return;
    
    const { clientWidth, clientHeight } = container;
    const { x, y } = mousePosition;
    
    // Calculate distances from each edge
    const distanceFromLeft = x;
    const distanceFromRight = clientWidth - x;
    const distanceFromTop = y;
    const distanceFromBottom = clientHeight - y;
    
    // Calculate scroll speeds based on distance from edges
    // The closer to the edge, the faster the scroll
    let scrollX = 0;
    let scrollY = 0;
    
    if (distanceFromLeft < EDGE_THRESHOLD) {
      // Scroll left (negative value)
      scrollX = -calculateScrollSpeed(distanceFromLeft);
    } else if (distanceFromRight < EDGE_THRESHOLD) {
      // Scroll right (positive value)
      scrollX = calculateScrollSpeed(distanceFromRight);
    }
    
    if (distanceFromTop < EDGE_THRESHOLD) {
      // Scroll up (negative value)
      scrollY = -calculateScrollSpeed(distanceFromTop);
    } else if (distanceFromBottom < EDGE_THRESHOLD) {
      // Scroll down (positive value)
      scrollY = calculateScrollSpeed(distanceFromBottom);
    }
    
    // If we need to scroll in any direction
    if (scrollX !== 0 || scrollY !== 0) {
      setIsAutoScrolling(true);
      
      // Start or continue auto-scrolling animation
      const performAutoScroll = () => {
        if (!container) return;
        
        // Apply scroll
        container.scrollLeft += scrollX;
        container.scrollTop += scrollY;
        
        // Continue animation
        autoScrollAnimationId.current = requestAnimationFrame(performAutoScroll);
      };
      
      // Start animation if not already running
      if (autoScrollAnimationId.current === null) {
        autoScrollAnimationId.current = requestAnimationFrame(performAutoScroll);
      }
    } else if (isAutoScrolling) {
      // Stop auto-scrolling if active but no longer needed
      setIsAutoScrolling(false);
      if (autoScrollAnimationId.current !== null) {
        cancelAnimationFrame(autoScrollAnimationId.current);
        autoScrollAnimationId.current = null;
      }
    }
    
    // Cleanup
    return () => {
      if (autoScrollAnimationId.current !== null) {
        cancelAnimationFrame(autoScrollAnimationId.current);
        autoScrollAnimationId.current = null;
      }
    };
  }, [mousePosition, isAutoScrolling, hasMouseMoved]);
  
  // Helper function to calculate scroll speed based on distance from edge
  const calculateScrollSpeed = (distance: number): number => {
    // Ensure distance is within threshold
    if (distance >= EDGE_THRESHOLD) return 0;
    
    // Calculate a value between 0 and MAX_SCROLL_SPEED
    // The closer to the edge (smaller distance), the closer to MAX_SCROLL_SPEED
    return MAX_SCROLL_SPEED * (1 - distance / EDGE_THRESHOLD);
  };
  
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

  // Generate only the visible portion of cells
  const visibleCells = useMemo(() => {
    if (grid.length === 0) return null;
    
    const cells = [];
    const startTime = performance.now();
    
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
              isCenter={isCenter}
              cellSize={cellSize}
              onClick={() => handleCellClick(row, col, cell.isScary, cell.isRoot)}
            />
          );
        }
      }
    }
    
    const endTime = performance.now();
    console.log(`Cell rendering took ${endTime - startTime}ms`);
    
    return cells;
  }, [grid, visibleArea, gridSize, cellSize, centerIndices, handleCellClick]);

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
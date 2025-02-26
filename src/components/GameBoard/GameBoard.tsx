import React, { useMemo, useState, useRef, useEffect } from 'react';
import './GameBoard.css';

interface GameBoardProps {
  gridSize?: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ gridSize = 100 }) => {
  // Calculate the exact center cell index
  const centerCellRowIndex = Math.floor(gridSize / 2);
  const centerCellColIndex = Math.floor(gridSize / 2);
  const centerCellIndex = (centerCellRowIndex * gridSize) + centerCellColIndex;
  
  // Add state to track mouse position
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Use ref for direct access to current mouse position without triggering re-renders
  const mousePositionRef = useRef({ x: -1000, y: -1000 });
  
  // Track mouse position relative to the grid - optimized for performance
  const handleMouseMove = (e: React.MouseEvent) => {
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update ref immediately for calculations
      mousePositionRef.current = { x, y };
      
      // Update state less frequently to avoid excessive re-renders
      requestAnimationFrame(() => {
        setMousePosition({ x, y });
      });
    }
  };
  
  // Reset mouse position when mouse leaves the grid
  const handleMouseLeave = () => {
    mousePositionRef.current = { x: -1000, y: -1000 };
    setMousePosition({ x: -1000, y: -1000 });
  };
  
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

  // Calculate cell positions and sizes once the component mounts
  const [cellPositions, setCellPositions] = useState<{ x: number, y: number, width: number, height: number }[]>([]);
  
  useEffect(() => {
    if (gridRef.current) {
      const updateCellPositions = () => {
        const gridElement = gridRef.current;
        if (!gridElement) return;
        
        const cellElements = gridElement.querySelectorAll('.grid-cell');
        if (cellElements.length === 0) return;
        
        // Get grid rect once for all calculations
        const gridRect = gridElement.getBoundingClientRect();
        
        // Calculate position for each cell
        // Using direct array instead of Array.from for performance
        const positions = [];
        for (let i = 0; i < cellElements.length; i++) {
          const cell = cellElements[i] as HTMLElement;
          const rect = cell.getBoundingClientRect();
          positions.push({
            x: rect.left - gridRect.left + rect.width / 2,
            y: rect.top - gridRect.top + rect.height / 2,
            width: rect.width,
            height: rect.height
          });
        }
        
        setCellPositions(positions);
      };
      
      // Initial calculation
      requestAnimationFrame(updateCellPositions);
      
      // Update on resize, less frequently to improve performance
      let resizeTimer: number | null = null;
      const handleResize = () => {
        if (resizeTimer !== null) {
          window.clearTimeout(resizeTimer);
        }
        resizeTimer = window.setTimeout(updateCellPositions, 100);
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (resizeTimer !== null) {
          window.clearTimeout(resizeTimer);
        }
      };
    }
  }, [gridCells.length]); // Only recalculate when grid size changes

  // Function to calculate scale based on distance from mouse
  const calculateScale = (cellX: number, cellY: number) => {
    // Use ref for direct access to current mouse position
    const mousePos = mousePositionRef.current;
    const dx = cellX - mousePos.x;
    const dy = cellY - mousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Increased magnification radius from 80px to 200px
    const radius = 200;
    
    if (distance <= radius) {
      // Reduced zoom intensity by half
      // Scale from 1.0 (at radius edge) to 2.0 (at center)
      const normalizedDistance = distance / radius;
      // Using a less aggressive falloff function but with reduced intensity
      const scale = 1 + (1 - normalizedDistance) * 0.5 + Math.pow(1 - normalizedDistance, 2) * 0.5;
      return Math.max(1, Math.min(2, scale)); // Clamp between 1.0 and 2.0
    }
    
    return 1; // No scaling outside the radius
  };

  return (
    <div className="gameboard">
      <div className="game-content">
        <div 
          className="number-grid"
          ref={gridRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {gridCells.map((cell, index) => {
            const { intensity, delay } = cell.shakeParams;
            
            // Calculate scale if we have cell positions
            // Only calculate for cells that are potentially within magnification radius
            let scale = 1;
            if (cellPositions[index]) {
              const cellPos = cellPositions[index];
              // Use ref for direct access to current mouse position
              const mousePos = mousePositionRef.current;
              const dx = cellPos.x - mousePos.x;
              const dy = cellPos.y - mousePos.y;
              // Quick optimization: Skip calculation if cell is definitely outside radius
              const roughDistance = Math.abs(dx) + Math.abs(dy); // Manhattan distance
              if (roughDistance < 240) { // Slightly larger than radius to account for imprecision
                scale = calculateScale(cellPos.x, cellPos.y);
              }
            }
            
            // Apply scale as a transform style, keeping the shake animation
            const cellStyle = {
              // We need to combine the scale transform with the shake animation
              // For this we're using CSS variables to control the scale
              '--scale': scale,
              zIndex: scale > 1 ? Math.floor(scale * 10) : 1, // Higher z-index for scaled elements
            } as React.CSSProperties;
            
            return (
              <div 
                key={`cell-${index}`} 
                className={`grid-cell ${cell.isCenter ? 'center-cell' : ''} ${intensity} ${delay} ${scale > 1 ? 'magnified' : ''}`}
                style={cellStyle}
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
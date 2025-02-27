import React, { createContext, useState, useContext, ReactNode } from 'react';

type GameLevel = {
  name: string;
  id: string;
  // You can add more properties relevant to a level
};

type GroupBox = {
  id: string;
  number: string; // "01", "02", etc.
  completionPercentage: number;
  isComplete: boolean;
};

type GridCell = {
  row: number;
  col: number;
  value: number;
  isScary: boolean;
  isSelected: boolean;
  isRevealed: boolean; // True if this cell is part of a revealed group
  isRoot: boolean; // True if this is a root scary number
  groupId: string | null; // ID of the group this cell belongs to (if any)
};

interface GameContextType {
  // Level info
  currentLevel: GameLevel;
  completionPercentage: number;
  setCurrentLevel: (level: GameLevel) => void;
  setCompletionPercentage: (percentage: number) => void;
  
  // Group boxes state
  groupBoxes: GroupBox[];
  updateGroupBox: (id: string, percentage: number) => void;
  
  // Game grid state
  grid: GridCell[][];
  gridSize: number;
  revealScaryNeighbors: (row: number, col: number) => void;
  selectScaryNumber: (row: number, col: number) => void;
  isGroupComplete: (groupId: string) => boolean;
  
  // Game state management
  initializeGrid: (size: number) => void;
}

// Initial values
const initialGroupBoxes: GroupBox[] = [
  { id: 'box1', number: '01', completionPercentage: 0, isComplete: false },
  { id: 'box2', number: '02', completionPercentage: 0, isComplete: false },
  { id: 'box3', number: '03', completionPercentage: 0, isComplete: false },
  { id: 'box4', number: '04', completionPercentage: 0, isComplete: false },
  { id: 'box5', number: '05', completionPercentage: 0, isComplete: false },
];

const initialGameContext: GameContextType = {
  currentLevel: { name: 'Cold Harbor', id: 'cold-harbor' },
  completionPercentage: 0, // Start at 0% instead of 67%
  setCurrentLevel: () => {},
  setCompletionPercentage: () => {},
  
  groupBoxes: initialGroupBoxes,
  updateGroupBox: () => {},
  
  grid: [],
  gridSize: 100,
  revealScaryNeighbors: () => {},
  selectScaryNumber: () => {},
  isGroupComplete: () => false,
  
  initializeGrid: () => {},
};

// Create context
const GameContext = createContext<GameContextType>(initialGameContext);

// Custom hook for using the context
export const useGameContext = () => useContext(GameContext);

// Provider component
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [currentLevel, setCurrentLevel] = useState<GameLevel>(initialGameContext.currentLevel);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [groupBoxes, setGroupBoxes] = useState<GroupBox[]>(initialGroupBoxes);
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [gridSize, setGridSize] = useState<number>(100);

  // Get neighboring cells
  const getNeighborCells = (row: number, col: number): {row: number, col: number}[] => {
    const neighbors: {row: number, col: number}[] = [];
    
    // Check all 8 possible neighbors
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        // Skip the cell itself
        if (r === 0 && c === 0) continue;
        
        const newRow = row + r;
        const newCol = col + c;
        
        // Check if within grid bounds
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
          neighbors.push({ row: newRow, col: newCol });
        }
      }
    }
    
    return neighbors;
  };

  // Initialize the grid with random values and scary cells
  const initializeGrid = (size: number) => {
    console.log(`Initializing grid with size ${size}x${size}`);
    
    const newGrid: GridCell[][] = [];
    
    // Create empty grid
    for (let i = 0; i < size; i++) {
      const row: GridCell[] = [];
      for (let j = 0; j < size; j++) {
        row.push({
          row: i,
          col: j,
          value: Math.floor(Math.random() * 10), // Random digit 0-9
          isScary: false,
          isSelected: false,
          isRevealed: false,
          isRoot: false,   // New property to distinguish root scary numbers
          groupId: null
        });
      }
      newGrid.push(row);
    }
    
    // Make 1% of cells scary
    const totalCells = size * size;
    const scaryCount = Math.floor(totalCells * 0.01);
    
    let count = 0;
    while (count < scaryCount) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      
      if (!newGrid[row][col].isScary) {
        newGrid[row][col].isScary = true;
        newGrid[row][col].isRoot = true;  // Mark as a root scary number
        count++;
      }
    }
    
    setGridSize(size);
    setGrid(newGrid);
  };

  // Reveal neighboring scary cells
  const revealScaryNeighbors = (row: number, col: number) => {
    console.log('Starting revealScaryNeighbors for', row, col);
    
    // Create a DEEP copy of the grid to ensure proper state updates
    const newGrid = grid.map(row => [...row]);
    const neighbors = getNeighborCells(row, col);
    console.log('Found neighbors:', neighbors.length);
    
    // Choose a random group ID for this chain of scary numbers
    // We'll use the timestamp plus a random number to ensure uniqueness
    const groupId = `group-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // List of all regular neighbors we might convert to scary
    const regularNeighbors: {row: number, col: number}[] = [];
    
    // Find all regular neighbors (non-scary, non-selected cells)
    neighbors.forEach(({row: r, col: c}) => {
      console.log(`Checking neighbor [${r}, ${c}] - isScary: ${newGrid[r][c].isScary}, isSelected: ${newGrid[r][c].isSelected}`);
      if (!newGrid[r][c].isScary && !newGrid[r][c].isSelected) {
        regularNeighbors.push({row: r, col: c});
      }
    });
    
    console.log('Found regular neighbors to convert:', regularNeighbors.length);
    
    // Determine how many neighbors to convert to scary (between 1 and 20, or all if less)
    const maxNeighborsToConvert = Math.min(
      regularNeighbors.length,
      Math.max(1, Math.floor(Math.random() * 20) + 1)
    );
    console.log('Will convert', maxNeighborsToConvert, 'neighbors to scary');
    
    // Shuffle the array to get random neighbors
    for (let i = regularNeighbors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [regularNeighbors[i], regularNeighbors[j]] = [regularNeighbors[j], regularNeighbors[i]];
    }
    
    // Convert only the chosen number of neighbors to scary
    const neighborsToConvert = regularNeighbors.slice(0, maxNeighborsToConvert);
    
    // Convert the neighbors to scary and mark as revealed
    neighborsToConvert.forEach(({row: r, col: c}) => {
      console.log(`Converting neighbor [${r}, ${c}] to scary and revealing it`);
      newGrid[r][c].isScary = true;     // Make the cell scary
      newGrid[r][c].isRevealed = true;  // Mark it as revealed
      newGrid[r][c].isRoot = false;     // These are not root scary numbers
      newGrid[r][c].groupId = groupId;  // Assign to the same group
    });
    
    // Also mark the clicked cell with the same group ID and as selected
    newGrid[row][col].groupId = groupId;
    newGrid[row][col].isSelected = true; // Mark the clicked cell as selected
    console.log(`Marked clicked cell [${row}, ${col}] as selected`);
    
    // Assign this new chain to a group box with the least completion
    assignGroupToBox(groupId);
    
    // Use functional update to ensure we're working with the latest state
    setGrid(newGrid);
    console.log('Grid updated with new scary neighbors');
  };

  // Select a scary number
  const selectScaryNumber = (row: number, col: number) => {
    console.log(`Selecting scary number at [${row}, ${col}]`);
    if (!grid[row][col].isScary) return;
    
    // Create a DEEP copy of the grid
    const newGrid = grid.map(row => [...row]);
    newGrid[row][col].isSelected = true;
    
    // If the cell is part of a group, update the group's completion
    if (newGrid[row][col].groupId) {
      updateGroupCompletion(newGrid[row][col].groupId);
    }
    
    // Use functional update to ensure we're working with the latest state
    setGrid(newGrid);
    console.log(`Updated grid with selected cell at [${row}, ${col}]`);
  };

  // Check if a group is complete (all scary cells selected)
  const isGroupComplete = (groupId: string) => {
    // Count total cells in group and selected cells in group
    let totalInGroup = 0;
    let selectedInGroup = 0;
    
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cell = grid[row][col];
        if (cell.groupId === groupId) {
          totalInGroup++;
          if (cell.isSelected) {
            selectedInGroup++;
          }
        }
      }
    }
    
    // Group is complete if all cells in the group are selected
    return totalInGroup > 0 && selectedInGroup === totalInGroup;
  };

  // Assign a new chain of scary numbers to the group box with the least completion
  const assignGroupToBox = (groupId: string) => {
    // Find the group box with the lowest completion percentage
    let lowestCompletionBox = groupBoxes[0];
    
    for (const box of groupBoxes) {
      if (box.completionPercentage < lowestCompletionBox.completionPercentage) {
        lowestCompletionBox = box;
      }
    }
    
    // Count cells in this new group
    let cellsInNewGroup = 0;
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col].groupId === groupId) {
          cellsInNewGroup++;
        }
      }
    }
    
    // Update the group box's completion percentage based on the total scary cells
    // Each group box represents 20% of the game, and each scary cell contributes equally
    const totalScaryCells = Math.floor(gridSize * gridSize * 0.01); // 1% of cells are scary
    const scaryCellsPerGroup = totalScaryCells / 5; // 5 groups
    
    // Initialize the group's contribution to the box
    // The full contribution will be realized when all cells in the group are selected
    const potentialContribution = (cellsInNewGroup / scaryCellsPerGroup) * 100;
    
    // Store the groupId association with the box ID for future reference
    // We'll use a simple data structure in state to track this
    setGroupAssignments(prev => ({
      ...prev,
      [groupId]: {
        boxId: lowestCompletionBox.id,
        potentialContribution
      }
    }));
  };

  // Update the completion of a group when a scary cell is selected
  const updateGroupCompletion = (groupId: string) => {
    // Get the group assignment info
    const assignment = groupAssignments[groupId];
    if (!assignment) return;
    
    // Check if the group is now complete
    const isComplete = isGroupComplete(groupId);
    
    // If the group is complete, add its contribution to the box
    if (isComplete) {
      updateGroupBox(assignment.boxId, 
        groupBoxes.find(box => box.id === assignment.boxId)?.completionPercentage + assignment.potentialContribution
      );
    }
  };

  // State to track which groups are assigned to which boxes
  const [groupAssignments, setGroupAssignments] = useState<Record<string, {
    boxId: string;
    potentialContribution: number;
  }>>({});

  // Update a group box's completion percentage
  const updateGroupBox = (id: string, percentage: number) => {
    setGroupBoxes(prev => 
      prev.map(box => 
        box.id === id 
          ? { ...box, completionPercentage: percentage, isComplete: percentage >= 100 } 
          : box
      )
    );
    
    // Calculate overall completion based on all boxes
    const overallPercentage = 
      groupBoxes.reduce((total, box) => total + (box.completionPercentage / 5), 0);
    setCompletionPercentage(Math.min(overallPercentage, 100));
  };

  return (
    <GameContext.Provider
      value={{
        currentLevel,
        completionPercentage,
        setCurrentLevel,
        setCompletionPercentage,
        
        groupBoxes,
        updateGroupBox,
        
        grid,
        gridSize,
        revealScaryNeighbors,
        selectScaryNumber,
        isGroupComplete,
        
        initializeGrid
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;

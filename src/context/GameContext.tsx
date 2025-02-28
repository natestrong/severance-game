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
  isCounted: boolean; // True if this cell has already been counted towards completion
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
  selectScaryNumber: (row: number, col: number, isRoot: boolean) => void;
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
          groupId: null,
          isCounted: false // Initialize as not counted
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
    
    // Make sure the cell is a root scary cell
    if (!grid[row][col].isScary || !grid[row][col].isRoot) {
      console.log(`Cell at [${row}, ${col}] is not a root scary cell, isScary: ${grid[row][col].isScary}, isRoot: ${grid[row][col].isRoot}`);
      return;
    }
    
    // DEBUG: Log counts of scary cells and root scary cells in the grid
    let scaryCount = 0;
    let rootScaryCount = 0;
    
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell.isScary) scaryCount++;
        if (cell.isRoot) rootScaryCount++;
      });
    });
    
    console.log(`Current grid has ${scaryCount} scary cells, ${rootScaryCount} of which are root scary cells`);
    
    // Create a DEEP copy of the grid to ensure proper state updates
    const newGrid = JSON.parse(JSON.stringify(grid));
    console.log('Created deep copy of grid');
    
    // Choose a random group ID for this chain of scary numbers
    const groupId = `group-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log(`Created group ID: ${groupId}`);
    
    // Mark the clicked cell with the group ID
    newGrid[row][col].groupId = groupId;
    newGrid[row][col].isSelected = true; // Mark the clicked cell as selected
    console.log(`Marked clicked cell [${row}, ${col}] as selected, isScary: ${newGrid[row][col].isScary}`);
    
    // Determine how many scary neighbors to create (between 1 and 20)
    const numToCreate = Math.max(1, Math.floor(Math.random() * 20) + 1);
    console.log(`Will create ${numToCreate} scary neighbors in a snake-like chain`);
    
    // Keep track of all cells in the chain (starting with the root cell)
    const chainCells: {row: number, col: number}[] = [{row, col}];
    
    // Keep track of newly created scary cells
    const newlyCreatedScary: {row: number, col: number}[] = [];
    
    // Create the chain of scary numbers
    let attemptsRemaining = 100; // Safeguard against infinite loops
    
    while (newlyCreatedScary.length < numToCreate && attemptsRemaining > 0) {
      attemptsRemaining--;
      
      // Randomly select any existing cell in the chain to grow from
      const sourceIndex = Math.floor(Math.random() * chainCells.length);
      const sourceCell = chainCells[sourceIndex];
      
      // Get all neighbors of this source cell
      const neighbors = getNeighborCells(sourceCell.row, sourceCell.col);
      
      // Filter to valid candidates (not already scary or selected)
      const validCandidates = neighbors.filter(({row: r, col: c}) => {
        return !newGrid[r][c].isScary && !newGrid[r][c].isSelected;
      });
      
      if (validCandidates.length > 0) {
        // Randomly select one neighbor to make scary
        const randomIndex = Math.floor(Math.random() * validCandidates.length);
        const nextCell = validCandidates[randomIndex];
        
        // Make this cell scary
        newGrid[nextCell.row][nextCell.col].isScary = true;
        newGrid[nextCell.row][nextCell.col].isRevealed = true;
        newGrid[nextCell.row][nextCell.col].isRoot = false;
        newGrid[nextCell.row][nextCell.col].groupId = groupId;
        
        // Add this new cell to both our chain and newly created list
        chainCells.push(nextCell);
        newlyCreatedScary.push(nextCell);
        
        console.log(`Added new scary cell at [${nextCell.row}, ${nextCell.col}]`);
      }
    }
    
    console.log(`Created ${newlyCreatedScary.length} new scary cells in a snake-like chain`);
    
    // Assign this new chain to a group box with the least completion
    assignGroupToBox(groupId);
    
    // Update the grid with our changes
    setGrid(newGrid);
  };

  // Select a scary number
  const selectScaryNumber = (row: number, col: number, isRoot: boolean) => {
    console.log(`Selecting scary number at [${row}, ${col}], isRoot: ${isRoot}`);
    
    // First, check if this is actually a scary number
    if (!grid[row][col].isScary) {
      console.log(`Cell at [${row}, ${col}] is not scary, aborting selectScaryNumber`);
      return;
    }
    
    // Don't do anything if the cell is already counted
    if (grid[row][col].isCounted) {
      console.log(`Cell at [${row}, ${col}] is already counted, ignoring click`);
      return;
    }
    
    console.log(`Cell is valid for selection, proceeding with selectScaryNumber`);
    
    // Create a DEEP copy of the grid
    const newGrid = JSON.parse(JSON.stringify(grid));
    newGrid[row][col].isSelected = true;
    
    console.log(`Marked cell [${row}, ${col}] as selected`);
    
    // If the cell is part of a group, update the group's completion
    if (newGrid[row][col].groupId) {
      const groupId = newGrid[row][col].groupId;
      console.log(`Cell belongs to group ${groupId}, checking for completion`);
      
      // Check if the group is now complete
      const isComplete = checkAndHandleGroupCompletion(newGrid, groupId);
      
      if (!isComplete) {
        // Just update the grid with the new selected state if group is not complete
        console.log(`Group ${groupId} is not complete yet, updating grid`);
        setGrid(newGrid);
      } else {
        console.log(`Group ${groupId} is now complete!`);
      }
    } else {
      console.log(`Cell does not belong to a group, just updating grid`);
      // Use functional update to ensure we're working with the latest state
      setGrid(newGrid);
    }
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
    // Find the group box with the lowest completion percentage that's not already full
    let availableBoxes = groupBoxes.filter(box => box.completionPercentage < 100);
    
    // If all boxes are full (100%), nothing to do
    if (availableBoxes.length === 0) {
      console.log('All group boxes are already at 100%, cannot assign new groups');
      return;
    }
    
    // Get the box with the lowest completion percentage
    let lowestCompletionBox = availableBoxes.reduce((prev, current) => 
      prev.completionPercentage <= current.completionPercentage ? prev : current
    );
    
    // Count cells in this new group (each one will be worth one percentage point)
    let cellsInNewGroup = 0;
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col].groupId === groupId) {
          cellsInNewGroup++;
        }
      }
    }
    
    console.log(`Assigning group ${groupId} with ${cellsInNewGroup} cells to box ${lowestCompletionBox.id}`);
    
    // Store the groupId association with the box ID for future reference
    setGroupAssignments(prev => ({
      ...prev,
      [groupId]: {
        boxId: lowestCompletionBox.id,
        potentialContribution: cellsInNewGroup  // Each cell is worth 1 percentage point
      }
    }));
    
    console.log(`Group ${groupId} assigned to box ${lowestCompletionBox.id}`);
  };

  // Update a group box's completion percentage
  const updateGroupBox = (id: string, percentage: number) => {
    setGroupBoxes(prev => 
      prev.map(box => {
        if (box.id === id) {
          // Cap the percentage at 100% - box can't exceed 100%
          const newPercentage = Math.min(percentage, 100);
          return {
            ...box,
            completionPercentage: newPercentage,
            isComplete: newPercentage >= 100
          };
        }
        return box;
      })
    );
    
    // Calculate overall completion based on all boxes
    // Each box represents 20% of the total game, so divide by 5
    setTimeout(() => {
      const overallPercentage = 
        groupBoxes.reduce((total, box) => total + (Math.min(box.completionPercentage, 100) / 5), 0);
      setCompletionPercentage(Math.min(overallPercentage, 100));
    }, 0);
  };

  // Update the completion of a group when all letters in the group are selected
  const updateGroupCompletionAfterCollect = (groupId: string, numberOfPoints: number) => {
    // Get the group assignment info
    const assignment = groupAssignments[groupId];
    if (!assignment) return;
    
    // Find the box
    const box = groupBoxes.find(box => box.id === assignment.boxId);
    
    // Only update if the box exists and it's not already at 100%
    if (box && box.completionPercentage < 100) {
      // Each letter in the group is worth TWO points now (double speed)
      const pointsToAdd = numberOfPoints * 2;
      console.log(`Adding ${pointsToAdd} points (${numberOfPoints} letters × 2) to box ${box.id}`);
      
      // If the box is already close to 100%, we cap it at 100%
      updateGroupBox(
        assignment.boxId, 
        Math.min(100, box.completionPercentage + pointsToAdd)
      );
    }
  };

  // Check if a group is complete and handle it if it is
  const checkAndHandleGroupCompletion = (gridState: GridCell[][], groupId: string | null) => {
    if (!groupId) return false;
    
    // Count total cells in group and selected cells in group
    let totalInGroup = 0;
    let selectedInGroup = 0;
    
    // Find all cells in this group
    const cellsInGroup: {row: number, col: number}[] = [];
    
    for (let row = 0; row < gridState.length; row++) {
      for (let col = 0; col < gridState[row].length; col++) {
        const cell = gridState[row][col];
        if (cell.groupId === groupId) {
          totalInGroup++;
          cellsInGroup.push({row, col});
          if (cell.isSelected) {
            selectedInGroup++;
          }
        }
      }
    }
    
    // Group is complete if all cells in the group are selected
    const isComplete = totalInGroup > 0 && selectedInGroup === totalInGroup;
    
    if (isComplete) {
      console.log(`Group ${groupId} is complete with ${totalInGroup} cells selected`);
      
      // Make a deep copy of the grid to work with
      const newGrid = gridState.map(row => [...row]);
      
      // When a group is complete, mark all cells as counted but keep them visually selected
      cellsInGroup.forEach(({row, col}) => {
        // Keep the cells visually selected but mark them as counted
        newGrid[row][col].isCounted = true;
      });
      
      // Update the group box's completion percentage with the collected points
      updateGroupCompletionAfterCollect(groupId, totalInGroup);
      
      // Update the grid to mark the completed group as counted
      setGrid(newGrid);
    }
    
    return isComplete;
  };

  // State to track which groups are assigned to which boxes
  const [groupAssignments, setGroupAssignments] = useState<Record<string, {
    boxId: string;
    potentialContribution: number;
  }>>({});

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

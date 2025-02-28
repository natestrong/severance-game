# Severence Game

A React TypeScript application with a clean layout featuring a header, game board, and footer.

## Project Overview

This project is a React application built with TypeScript and Vite, structured with a simple and clean layout:

- **Header**: Contains the game title
- **Game Board**: Main content area for the game (takes up most of the screen space)
- **Footer**: Contains copyright information

## Technologies Used

- React 18
- TypeScript
- Vite (for fast development and bundling)
- CSS Modules

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm (v6 or newer)

### Installation

1. Clone the repository
   ```bash
   git clone [repository URL]
   cd severence-game
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser to http://localhost:5173

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build locally

## Project Structure

```
severence-game/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Header/
│   │   ├── GameBoard/
│   │   ├── Letter/
│   │   └── Footer/
│   ├── context/
│   │   └── GameContext.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── package.json
└── tsconfig.json
```

## Component Architecture

### Letter Component

The Letter component (`/src/components/Letter/Letter.tsx`) is responsible for rendering individual cells on the game board with the following features:

- **Dynamic Animations**: 
  - Uses requestAnimationFrame for smooth, performance-optimized animations
  - Each letter has unique, deterministic but seemingly random movement
  - Random movement parameters are based on the letter's position in the grid
  - Animation includes slow-changing multipliers for organic movement over time

- **Selection Effects**:
  - Selected letters zoom with a bounce effect (scale 2.2x)
  - Each letter has a random zoom duration (0.2-0.6 seconds)
  - Custom cubic-bezier transition for the bounce effect
  - Selected cells stop animating and display a glow effect

- **Scary Letter Features**:
  - Scary letters and revealed neighbors have an additional jitter animation
  - Jitter is implemented as a fast, high-frequency CSS animation
  - When selected, jitter stops and the letter grows with a smooth transition

- **Performance Optimizations**:
  - Uses React.memo with custom comparison to prevent unnecessary re-renders
  - Hardware-accelerated transforms with will-change property
  - CSS containment for improved rendering performance

### GameBoard Component

The GameBoard component (`/src/components/GameBoard/GameBoard.tsx`) manages the grid of letters:

- **Virtualization**: Only renders the currently visible letters (plus a buffer zone) for performance
- **Grid Management**: Interfaces with GameContext to initialize and update the grid state
- **Interaction Handling**: Processes clicks on letters and triggers appropriate context methods
- **Responsive Layout**: Handles viewport changes and scrolling to maintain performance

### Game State Management

The GameContext (`/src/context/GameContext.tsx`) manages the game state:

- **Grid State**: Stores the grid of cells with properties like isScary, isSelected, isRevealed
- **Scary Neighbor Logic**: When a root scary letter is clicked, it reveals 1-20 neighboring letters as scary
- **Selection Tracking**: Manages which letters are selected and tracks groups of scary letters

## Game Rules

Below are the game rules that will be progressively implemented, with checkboxes to track our progress:

### Game Objective and Completion
- [ ] **Game Objective**: Find and refine all "scary numbers" to help complete the Cold Harbor game level
- [ ] **Level Completion**: The game completes when the Cold Harbor level reaches 100%

### Game Board and Scary Numbers
- [x] **Game Board**: The board contains numerous numbers, with 1% of them being "scary numbers"
- [x] **Identifying Scary Numbers**: Scary numbers have a more intense jitter compared to the normal slow shake of other numbers
- [x] **Number Selection**: Only scary numbers can be clicked and selected; regular numbers will not respond

### Scary Number Groups and Mechanics
- [x] **Group Formation**: When a scary number is clicked, 1-20 neighboring numbers become "scary" as well
- [x] **Chain Requirement**: All scary numbers in a group must form an unbroken chain of neighbors from the original selected number
- [x] **Group Completion**: When all numbers in a scary group are selected, they disappear from the board

### Progress Tracking System
- [x] **Group Boxes**: Five Group Boxes at the bottom of the page track completion progress
- [x] **Box Contribution**: Each Group Box contributes 20% to the overall level completion
- [x] **Scoring**: Each scary number in a completed group is worth two percentage points
- [x] **Random Assignment**: Completed scary groups are randomly assigned to an available Group Box
- [x] **Box Filling**: Group Boxes are filled up to 100% and then considered complete
- [ ] **Final Completion**: When all five Group Boxes reach 100%, the level is complete

### Implementation Order
1. First, implement the game board with basic number display and normal shaking animation
2. Add the Group Boxes UI at the bottom of the page
3. Implement the identification and special jitter for scary numbers
4. Create the logic for scary number selection and neighbor chain formation
5. Develop the group completion mechanics and number disappearance
6. Implement the scoring system and random Group Box assignment
7. Add the level completion detection and celebration

## Implementation Todos

### Context and State Management
- [x] Enhance GameContext to store scary numbers
- [x] Add state for tracking the five Group Boxes and their completion percentages 
- [x] Create functions for calculating neighbors of a cell
- [x] Implement chain detection algorithm to verify connected scary numbers
- [x] Add game completion calculation based on Group Box percentages

### UI Components
- [x] Create Group Boxes component for the bottom of the page
- [x] Add click handlers to GameBoard for scary number selection
- [x] Implement visual feedback for selected scary numbers
- [x] Add progress tracking UI for overall completion
- [ ] Create visual effects for completed groups

### Game Logic
- [x] Generate scary numbers (1% of total grid) with distinct jitter
- [x] Implement function to reveal neighboring scary numbers (1-20) when one is clicked
- [x] Create validation for unbroken chains of scary numbers
- [x] Implement group completion detection when all connected scary numbers are selected
- [x] Develop random assignment of completed groups to available Group Boxes

### Performance and Optimization
- [x] Optimize grid rendering for large number of cells
- [x] Implement efficient neighbor calculation
- [x] Add proper event handling to prevent excessive re-renders

## Animation System Details

The letter animation system works in two layers:

1. **Base Movement**: 
   - Each letter has a slow, organic movement using complex wave functions
   - The movement parameters vary based on the letter's position and seed
   - Parameters include magnitude (how far it moves), speed, and directionality

2. **Jitter Effect**:
   - Applied to scary letters and revealed neighbors 
   - Fast, high-frequency movement superimposed on the base animation
   - Creates a distinctly "scary" appearance that's easily identifiable

When a letter is selected:
1. All animations are stopped
2. The letter scales up with a bounce effect
3. A glow effect is applied
4. The position is fixed

This dual-layered animation system creates an immersive and responsive game experience while maintaining performance even with large grids.

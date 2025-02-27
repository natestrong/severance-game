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
│   │   └── Footer/
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── package.json
└── tsconfig.json
```

## Game Rules

Below are the game rules that will be progressively implemented, with checkboxes to track our progress:

### Game Objective and Completion
- [ ] **Game Objective**: Find and refine all "scary numbers" to help complete the Cold Harbor game level
- [ ] **Level Completion**: The game completes when the Cold Harbor level reaches 100%

### Game Board and Scary Numbers
- [ ] **Game Board**: The board contains numerous numbers, with 1% of them being "scary numbers"
- [ ] **Identifying Scary Numbers**: Scary numbers will have a more intense jitter compared to the normal slow shake of other numbers
- [ ] **Number Selection**: Only scary numbers can be clicked and selected; regular numbers will not respond

### Scary Number Groups and Mechanics
- [ ] **Group Formation**: When a scary number is clicked, 1-20 neighboring numbers become "scary" as well
- [ ] **Chain Requirement**: All scary numbers in a group must form an unbroken chain of neighbors from the original selected number
- [ ] **Group Completion**: When all numbers in a scary group are selected, they disappear from the board

### Progress Tracking System
- [ ] **Group Boxes**: Five Group Boxes at the bottom of the page track completion progress
- [ ] **Box Contribution**: Each Group Box contributes 20% to the overall level completion
- [ ] **Scoring**: Each scary number in a completed group is worth one percentage point
- [ ] **Random Assignment**: Completed scary groups are randomly assigned to an available Group Box
- [ ] **Box Filling**: Group Boxes are filled up to 100% and then considered complete
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
- [ ] Enhance GameContext to store scary numbers
- [ ] Add state for tracking the five Group Boxes and their completion percentages 
- [ ] Create functions for calculating neighbors of a cell
- [ ] Implement chain detection algorithm to verify connected scary numbers
- [ ] Add game completion calculation based on Group Box percentages

### UI Components
- [ ] Create Group Boxes component for the bottom of the page
- [ ] Add click handlers to GameBoard for scary number selection
- [ ] Implement visual feedback for selected scary numbers
- [ ] Add progress tracking UI for overall completion
- [ ] Create visual effects for completed groups

### Game Logic
- [ ] Generate scary numbers (1% of total grid) with distinct jitter
- [ ] Implement function to reveal neighboring scary numbers (1-20) when one is clicked
- [ ] Create validation for unbroken chains of scary numbers
- [ ] Implement group completion detection when all connected scary numbers are selected
- [ ] Develop random assignment of completed groups to available Group Boxes

### Performance and Optimization
- [ ] Optimize grid rendering for large number of cells
- [ ] Implement efficient neighbor calculation
- [ ] Add proper event handling to prevent excessive re-renders

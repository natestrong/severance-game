# Severence Game

**Play the game here: [https://natestrong.github.io/severance-game/](https://natestrong.github.io/severance-game/)**

A Severance-inspired macrodata refinement game built with React and TypeScript. Identify and select the "scary numbers" to help complete the Cold Harbor level.

## Project Overview

This game is a tribute to the Apple TV+ show 'Severance', inspired by the mysterious "macrodata refinement" task performed by the characters. The application is built with modern web technologies focused on performance, accessibility, and visual aesthetics:

- **Header**: Contains the Lumon logo and game title
- **Game Board**: The main interactive surface featuring the numbers grid with various animations
- **Footer**: Contains copyright information and displays the five progress tracker boxes
- **CRT Effect Overlay**: A retrofuturistic CRT screen effect using Three.js that enhances the Severance aesthetic

## Technologies Used

- **React 19**: Latest version of React for building the user interface
- **TypeScript**: For type safety and enhanced development experience
- **Vite**: For fast development and optimized production builds
- **Three.js & React Three Fiber**: For the CRT screen effect overlay
- **Framer Motion**: For advanced animations and transitions
- **Simplex Noise**: For procedural animation patterns
- **CSS Modules**: For component-scoped styling

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm (v8 or newer)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/natestrong/severance-game.git
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
- `npm run deploy` - Deploy the application to GitHub Pages

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

### Game Objective and Completion
- **Game Objective**: Find and refine all "scary numbers" to help complete the Cold Harbor game level
- **Level Completion**: The game completes when the Cold Harbor level reaches 100%

### Game Board and Scary Numbers
- **Game Board**: The board contains numerous numbers, with 1% of them being "scary numbers"
- **Identifying Scary Numbers**: Scary numbers have a more intense jitter compared to the normal slow shake of other numbers
- **Number Selection**: Only scary numbers can be clicked and selected; regular numbers will not respond

### Scary Number Groups and Mechanics
- **Group Formation**: When a scary number is clicked, 1-20 neighboring numbers become "scary" as well
- **Chain Requirement**: All scary numbers in a group must form an unbroken chain of neighbors from the original selected number
- **Group Completion**: When all numbers in a scary group are selected, they disappear from the board

### Progress Tracking System
- **Group Boxes**: Five Group Boxes at the bottom of the page track completion progress
- **Box Contribution**: Each Group Box contributes 20% to the overall level completion
- **Scoring**: Each scary number in a completed group is worth two percentage points
- **Random Assignment**: Completed scary groups are randomly assigned to an available Group Box
- **Box Filling**: Group Boxes are filled up to 100% and then considered complete
- **Final Completion**: When all five Group Boxes reach 100%, the level is complete

## Game Features

### Core Game Mechanics
- Grid Generation: Random number grid with "scary" cells (1% of total)
- Cell Selection: Click to select a cell, revealing its value
- Drag Selection: Click and drag to select multiple scary numbers in one motion
- Point System: Each selected cell is worth two points
- Score Tracking: Overall score and percentage per group box
- Group Completion: Track and handle group completion
- Visual Feedback: Clear distinction between selected, scary, and counted cells
- Text Selection Disabled: Text selection is disabled during drag operations to prevent accidental text selection
- Dynamic Scary Number Chains: When a root scary number is clicked, a random "snake-like" chain of 1-20 additional scary numbers is revealed

## Scary Number Mechanics

The game features an innovative approach to revealing scary numbers:

1. **Initial Distribution**: 1% of grid cells are randomly initialized as "root" scary numbers
2. **Dynamic Chain Generation**: When a root scary number is clicked, it reveals a chain of additional scary numbers
3. **Snake-like Pattern**: The chain forms a connected "snake-like" path from the root number
4. **Random Growth**: Each new scary number in the chain is:
   - Connected to at least one previously revealed scary number
   - Randomly selected from valid neighbors
   - Part of an unbroken chain leading back to the root
5. **Variable Chain Length**: Each chain randomly consists of 1-20 additional scary numbers
6. **Group Assignment**: Each chain is assigned to a group box for progress tracking
7. **Visual Distinction**: Scary numbers have a subtle jitter animation but otherwise look like normal numbers

This approach creates unpredictable, unique patterns each time a root scary number is clicked, enhancing gameplay variety and strategic depth.

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
2. The letter zooms with a bounce effect for visual feedback
3. A glow effect is applied
4. The position is fixed

## Architecture

The application follows a component-based architecture with React Context for state management:

### State Management

- **GameContext**: Central state management system handling game logic, scoring, and group management
- **useGameContext Hook**: Custom hook for components to access and update game state
- **Immutable Updates**: State updates use immutable patterns for better performance and predictability

### Performance Optimizations

- **Virtualized Rendering**: Only visible grid cells are rendered, improving performance for large grids
- **React.memo**: Components use memoization to prevent unnecessary re-renders
- **Custom Equality Checks**: Letter components use custom equality functions to minimize renders
- **Throttled Updates**: Animation updates are throttled and use requestAnimationFrame for efficiency
- **CSS Hardware Acceleration**: Transforms and animations use hardware acceleration where possible

### Special Effects

- **CRT Screen Effect**: Uses Three.js and React Three Fiber for post-processing effects
- **Chromatic Aberration**: Simulates the color separation seen in old CRT monitors
- **Bloom Effect**: Creates the glow effect characteristic of phosphor displays
- **Scanlines**: Subtle scanline effect to enhance the retro aesthetic

### Responsive Design

- **CSS Variables**: Custom properties for consistent theming and easy updates
- **Viewport Adjustments**: Layout adapts to different screen sizes and orientations
- **Performance-Aware Design**: Animation complexity scales based on device capabilities

This dual-layered animation system creates an immersive and responsive game experience while maintaining performance even with large grids.

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

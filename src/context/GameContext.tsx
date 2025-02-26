import React, { createContext, useState, useContext, ReactNode } from 'react';

type GameLevel = {
  name: string;
  id: string;
  // You can add more properties relevant to a level
};

interface GameContextType {
  currentLevel: GameLevel;
  completionPercentage: number;
  setCurrentLevel: (level: GameLevel) => void;
  setCompletionPercentage: (percentage: number) => void;
}

// Initial values
const initialGameContext: GameContextType = {
  currentLevel: { name: 'Cold Harbor', id: 'cold-harbor' },
  completionPercentage: 67, // Default value based on the image
  setCurrentLevel: () => {},
  setCompletionPercentage: () => {}
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
  const [completionPercentage, setCompletionPercentage] = useState<number>(initialGameContext.completionPercentage);

  return (
    <GameContext.Provider
      value={{
        currentLevel,
        completionPercentage,
        setCurrentLevel,
        setCompletionPercentage
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;

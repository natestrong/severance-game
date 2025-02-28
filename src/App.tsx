import React, { useEffect, useRef } from 'react'
import './App.css'
import Header from './components/Header/Header'
import GameBoard from './components/GameBoard/GameBoard'
import Footer from './components/Footer/Footer'
import AnimationContainer from './components/AnimationContainer/AnimationContainer'
import VictoryDialog from './components/VictoryDialog/VictoryDialog'
import { GameProvider, useGameContext } from './context/GameContext'

// Inner App component that can use the game context
const AppContent = () => {
  const { gameComplete, acknowledgeGameComplete } = useGameContext();
  const gameboardContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to the middle of the gameboard on component mount
  useEffect(() => {
    if (gameboardContainerRef.current) {
      const container = gameboardContainerRef.current;
      
      // Scroll to the center of the 5000x5000 gameboard
      // We need to account for the viewport size
      const scrollLeft = (5000 - container.clientWidth) / 2;
      const scrollTop = (5000 - container.clientHeight) / 2;
      
      container.scrollTo({
        left: scrollLeft,
        top: scrollTop,
        behavior: 'auto' // Instant scroll without animation
      });
    }
  }, []);

  return (
    <div className="app-container">
      <Header />
      <div className="gameboard-container" ref={gameboardContainerRef}>
        <GameBoard />
      </div>
      <Footer />
      <AnimationContainer />
      <VictoryDialog 
        isVisible={gameComplete} 
        onClose={acknowledgeGameComplete} 
      />
    </div>
  );
};

// Main App component that provides the GameContext
function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}

export default App

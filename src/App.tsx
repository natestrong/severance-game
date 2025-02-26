import React from 'react'
import './App.css'
import Header from './components/Header/Header'
import GameBoard from './components/GameBoard/GameBoard'
import Footer from './components/Footer/Footer'
import { GameProvider } from './context/GameContext'

function App() {
  return (
    <GameProvider>
      <div className="app-container">
        <Header />
        <div className="gameboard-container">
          <GameBoard />
        </div>
        <Footer />
      </div>
    </GameProvider>
  )
}

export default App

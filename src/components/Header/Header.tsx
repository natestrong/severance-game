import React from 'react';
import './Header.css';
import { useGameContext } from '../../context/GameContext';
import LumonLogo from '../../assets/Lumon_transparent.png';

const Header: React.FC = () => {
  const { currentLevel, completionPercentage } = useGameContext();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-text">
          <span className="level-name">{currentLevel.name}</span>
          <span className="completion-percentage">{completionPercentage}% Complete</span>
        </div>
        <div className="logo-container">
          <img src={LumonLogo} alt="Lumon Industries" className="lumon-logo" />
        </div>
      </div>
    </header>
  );
};

export default Header;
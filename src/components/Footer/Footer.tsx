import React from 'react';
import './Footer.css';
import GroupBox from '../GroupBox/GroupBox';
import { useGameContext } from '../../context/GameContext';

const Footer: React.FC = () => {
  const { groupBoxes, setCompletionPercentage } = useGameContext();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="number-boxes">
          {groupBoxes.map((box) => (
            <GroupBox
              key={box.id}
              boxNumber={box.number}
              progress={box.completionPercentage}
              id={box.id}
            />
          ))}
        </div>
        <div className="footer-divider"></div>
        <div className="footer-text">
          0x137056 : 0x08832E
        </div>
        {/* Hidden test button for forcing completion - can be removed in production */}
        <button 
          onClick={() => setCompletionPercentage(100)} 
          style={{ 
            position: 'absolute', 
            right: '10px', 
            bottom: '10px', 
            opacity: 0.5,
            fontSize: '10px'
          }}
        >
          Test Win
        </button>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import './Footer.css';
import GroupBox from '../GroupBox/GroupBox';
import { useGameContext } from '../../context/GameContext';

const Footer: React.FC = () => {
  // Get the group boxes data from context instead of using hard-coded values
  const { groupBoxes } = useGameContext();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="number-boxes">
          {groupBoxes.map((box) => (
            <GroupBox
              key={box.id}
              boxNumber={box.number}
              progress={box.completionPercentage}
            />
          ))}
        </div>
        <div className="footer-divider"></div>
        <div className="footer-text">
          0x137056 : 0x08832E
        </div>
      </div>
    </footer>
  );
};

export default Footer;
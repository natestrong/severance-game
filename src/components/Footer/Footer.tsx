import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  // Sample progress percentages (replace with actual values from your game logic)
  const progressValues = [75, 75, 59, 52, 75];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="number-boxes">
          {['01', '02', '03', '04', '05'].map((number, index) => (
            <div key={index} className="number-container">
              <div className="number-box">{number}</div>
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{width: `${progressValues[index]}%`}}
                  aria-valuenow={progressValues[index]}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span className="progress-text">{progressValues[index]}%</span>
                </div>
              </div>
            </div>
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
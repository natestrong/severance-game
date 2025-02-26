import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="number-boxes">
          <div className="number-box">01</div>
          <div className="number-box">02</div>
          <div className="number-box">03</div>
          <div className="number-box">04</div>
          <div className="number-box">05</div>
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
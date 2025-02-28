import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './VictoryDialog.css';
import lumonLogo from '../../assets/Lumon_transparent.png';

interface VictoryDialogProps {
  isVisible: boolean;
  onClose: () => void;
}

const VictoryDialog: React.FC<VictoryDialogProps> = ({ isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="victory-dialog-backdrop">
          <motion.div 
            className="victory-dialog"
            initial={{ y: -1000, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -1000, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 100,
              duration: 1.2
            }}
          >
            <button className="close-x" onClick={onClose}>X</button>
            <div className="dialog-content">
              <div className="victory-lumon-logo">
                <img src={lumonLogo} alt="Lumon Industries Logo" />
              </div>
              <p className="victory-text">
                Congratulations. Your efficiency and dedication have exemplified the Core Principles of Lumon Industries. Your continued excellence helps illuminate humanity's path forward. Please enjoy a period of structured leisure before your next assignment. Praise Kier.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VictoryDialog;

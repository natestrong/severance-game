import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import './VictoryDialog.css';
import lumonLogo from '../../assets/Lumon_transparent.png';

interface VictoryDialogProps {
  isVisible: boolean;
  onClose: () => void;
}

// Animation parameters - easily adjustable
const ANIMATION_PARAMS = {
  // Initial position off-screen (distance from top in pixels)
  initialOffsetY: -1000,
  // How far each jump moves in pixels
  jumpDistance: 100,
  // Duration of each jump in seconds
  jumpDuration: 0.15,
  // Pause between jumps in seconds
  pauseBetweenJumps: 0.15,
  // Number of jumps to make
  numberOfJumps: 10,
};

const VictoryDialog: React.FC<VictoryDialogProps> = ({ isVisible, onClose }) => {
  const controls = useAnimation();
  const isAnimatingRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Reset animation state when dialog visibility changes
  useEffect(() => {
    if (isVisible) {
      setIsClosing(false);
      // Start the jumping animation when dialog becomes visible
      jumpingAnimation();
    }
  }, [isVisible]);
  
  // Custom close handler with reverse animation
  const handleClose = async () => {
    if (!isAnimatingRef.current) {
      setIsClosing(true);
      await reverseJumpingAnimation();
      onClose();
    }
  };
  
  // Function to create the custom jumping animation sequence
  const jumpingAnimation = async () => {
    isAnimatingRef.current = true;
    
    // Initial position (off-screen)
    await controls.set({ y: ANIMATION_PARAMS.initialOffsetY, opacity: 0 });
    
    // Calculate the distance per jump to reach center
    const totalAnimationDistance = Math.abs(ANIMATION_PARAMS.initialOffsetY);
    const distancePerJump = totalAnimationDistance / ANIMATION_PARAMS.numberOfJumps;
    
    // Position after each jump
    let currentPosition = ANIMATION_PARAMS.initialOffsetY;
    
    // Make the dialog appear first
    await controls.start({ opacity: 1, transition: { duration: 0.2 } });
    
    // Execute each jump
    for (let i = 0; i < ANIMATION_PARAMS.numberOfJumps; i++) {
      // Calculate new position
      currentPosition += distancePerJump;
      
      // Jump to new position
      await controls.start({
        y: currentPosition,
        transition: {
          duration: ANIMATION_PARAMS.jumpDuration,
          ease: "anticipate" // Quick acceleration, then slowdown
        }
      });
      
      // Wait between jumps
      if (i < ANIMATION_PARAMS.numberOfJumps - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, ANIMATION_PARAMS.pauseBetweenJumps * 1000)
        );
      }
    }
    
    // No bounce - just position at final destination
    await controls.start({
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" }
    });
    
    isAnimatingRef.current = false;
  };
  
  // Function to create the reverse jumping animation sequence
  const reverseJumpingAnimation = async () => {
    isAnimatingRef.current = true;
    
    // Initial position (centered on screen)
    let currentPosition = 0;
    
    // Calculate the distance per jump to reach off-screen
    const totalAnimationDistance = Math.abs(ANIMATION_PARAMS.initialOffsetY);
    const distancePerJump = totalAnimationDistance / ANIMATION_PARAMS.numberOfJumps;
    
    // Execute each jump in reverse
    for (let i = 0; i < ANIMATION_PARAMS.numberOfJumps; i++) {
      // Calculate new position
      currentPosition -= distancePerJump;
      
      // Jump to new position
      await controls.start({
        y: currentPosition,
        transition: {
          duration: ANIMATION_PARAMS.jumpDuration,
          ease: "anticipate" 
        }
      });
      
      // Wait between jumps
      if (i < ANIMATION_PARAMS.numberOfJumps - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, ANIMATION_PARAMS.pauseBetweenJumps * 1000)
        );
      }
    }
    
    // Fade out at the end
    await controls.start({
      opacity: 0,
      transition: { duration: 0.2 }
    });
    
    isAnimatingRef.current = false;
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="victory-dialog-backdrop">
          <motion.div 
            className="victory-dialog"
            initial={false}
            animate={controls}
          >
            <button className="close-x" onClick={handleClose}>X</button>
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

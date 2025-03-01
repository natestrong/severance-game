import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import './VictoryDialog.css';
import lumonLogo from '../../assets/Lumon_transparent.png';
import { useGameContext } from '../../context/GameContext';

// List of possible victory messages
const lumonVictoryMessages = [
  "Excellent work, Refiner. Your vigilance honors Kier's legacy. You've earned a well-deserved Music Dance Experience.",

  "Macrodata successfully refined. Your efforts fortify Lumon's grand vision. Please enjoy a complimentary Melon Bar during your Wellness session.",

  "Splendid refinement today. You've once again proven yourself worthy of the Waffle Party nomination. Kier smiles upon your diligence.",

  "Task complete. Macrodata fears your meticulousness. You are truly an exemplar of Lumon's nine core principles.",

  "Outstanding performance. Your work ethic aligns seamlessly with Lumon's harmony and purpose. Petey would be proud.",

  "Your accuracy and speed today are commendable. Please reflect on your achievements during the scheduled Quiet Reflection Period. Praise Kier.",

  "Data refined. The Board is pleased with your unwavering commitment. May your next cycle be equally fruitful and free of Defiant Jazz.",

  "You've illuminated Lumon's path toward perfection today. Please proceed calmly to the Break Room—strictly for relaxation purposes.",

  "Marvelous refinement efficiency. Lumon thanks you. Your performance secures you another step closer to earning a coveted Finger Trap.",

  "Congratulations, loyal refiner. Your diligence contributes profoundly to human betterment. Irving would nod approvingly.",
  
  // Include the original message as well
  "Congratulations. Your efficiency and dedication have exemplified the Core Principles of Lumon Industries. Your continued excellence helps illuminate humanity's path forward. Please enjoy a period of structured leisure before your next assignment. Praise Kier."
];

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
  const [victoryMessage, setVictoryMessage] = useState("");
  const { resetGame, acknowledgeGameComplete } = useGameContext();
  
  // Reset animation state when dialog visibility changes
  useEffect(() => {
    if (isVisible) {
      setIsClosing(false);
      // Pick a random victory message
      const randomIndex = Math.floor(Math.random() * lumonVictoryMessages.length);
      setVictoryMessage(lumonVictoryMessages[randomIndex]);
      // Start the jumping animation when dialog becomes visible
      jumpingAnimation();
    }
  }, [isVisible]);
  
  // Custom close handler with reverse animation
  const handleClose = async () => {
    if (!isAnimatingRef.current) {
      setIsClosing(true);
      await reverseJumpingAnimation();
      resetGame(); // Reset the game when dialog closes (this includes acknowledgeGameComplete)
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
                {victoryMessage}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VictoryDialog;

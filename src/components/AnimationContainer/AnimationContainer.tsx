import React, { useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';
import AnimatedPath from '../AnimatedPath/AnimatedPath';
import Portal from '../Portal/Portal';

/**
 * Container component that manages and renders all active animations
 * This is rendered at the app root level to ensure animations can move freely
 */
const AnimationContainer: React.FC = () => {
  const { activeAnimations, removeAnimation } = useGameContext();
  
  useEffect(() => {
    console.log(`AnimationContainer: active animations count: ${activeAnimations.length}`);
    
    if (activeAnimations.length > 0) {
      console.log('Current animations:', activeAnimations);
    }
  }, [activeAnimations]);
  
  return (
    <Portal>
      {activeAnimations.map((animation) => (
        <AnimatedPath
          key={animation.id}
          startX={animation.startX}
          startY={animation.startY}
          endX={animation.endX}
          endY={animation.endY}
          value={animation.value}
          onAnimationComplete={() => removeAnimation(animation.id)}
          onComplete={animation.onComplete}
        />
      ))}
    </Portal>
  );
};

export default AnimationContainer;

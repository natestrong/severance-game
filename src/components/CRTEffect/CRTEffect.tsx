import React, { useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, ChromaticAberration, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import useVisibility from './useVisibility';
import './CRTEffect.css';

// Custom CRT effects using post-processing effects
const CRTEffects = () => {
  useThree(); // Keep the hook even if we don't use size
  const [chromaticOffset, setChromaticOffset] = useState(0.003);
  const isVisible = useVisibility();
  
  // Only animate the chromatic aberration for better performance
  useFrame(({ clock }) => {
    // Skip updating if not visible (tab inactive)
    if (!isVisible) return;
    
    const t = clock.getElapsedTime();
    // Subtle animation for chromatic aberration
    setChromaticOffset(0.003 + Math.sin(t * 0.5) * 0.0015);
  });

  return (
    <EffectComposer enabled={isVisible} renderPriority={1}>
      {/* Chromatic aberration - RGB color shift */}
      <ChromaticAberration 
        offset={[chromaticOffset * 3, chromaticOffset * 2]} 
        blendFunction={BlendFunction.NORMAL}
      />
      
      {/* Simple phosphor glow - brighter and wider */}
      <Bloom 
        intensity={2.0}     /* Brighter glow */
        luminanceThreshold={0.15}  /* Lower threshold to make more elements glow */
        luminanceSmoothing={0.7}   /* Less smoothing for more pronounced effect */
        radius={0.9}       /* Slightly wider radius */
      />
    </EffectComposer>
  );
};

// Fullscreen quad to render the scene
const FullscreenQuad = () => {
  const { viewport } = useThree();
  
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial transparent color="#ffffff" opacity={0} />
    </mesh>
  );
};

// Main CRT Effect component
const CRTEffect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isVisible = useVisibility();
  
  // Directly render children and add overlay effects separately
  return (
    <>
      {/* Render original content without wrapping */}
      {children}
      
      {/* Add CRT overlay without affecting interaction */}
      <div className="crt-overlay" style={{ pointerEvents: 'none' }}>
        {/* Add phosphor glow overlay */}
        <div className="crt-phosphor-overlay"></div>
        <Canvas
          gl={{
            powerPreference: "high-performance",
            antialias: false, // Disable antialiasing for better performance
            stencil: false,   // Disable stencil buffer if not needed
            depth: false      // Disable depth buffer if not needed
          }}
          frameloop={isVisible ? "always" : "never"} // Pause rendering when not visible
          style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10000 }} // Ensure it's above everything
        >
          <Suspense fallback={null}>
            <FullscreenQuad />
            <CRTEffects />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
};

export default CRTEffect;

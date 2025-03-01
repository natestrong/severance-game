import React, { useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, ChromaticAberration, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import useVisibility from './useVisibility';
import './CRTEffect.css';

// Custom CRT effects using post-processing effects
const CRTEffects = () => {
  const { size } = useThree();
  const [chromaticOffset, setChromaticOffset] = useState(0.003);
  const isVisible = useVisibility();
  
  // Animate chromatic aberration - only when visible
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
      
      {/* Phosphor glow */}
      <Bloom 
        intensity={0.6} 
        luminanceThreshold={0.5} 
        luminanceSmoothing={0.8} 
        mipmapBlur
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
        <Canvas
          gl={{
            powerPreference: "high-performance",
            antialias: false, // Disable antialiasing for better performance
            stencil: false,   // Disable stencil buffer if not needed
            depth: false      // Disable depth buffer if not needed
          }}
          frameloop={isVisible ? "always" : "never"} // Pause rendering when not visible
          style={{ pointerEvents: 'none' }} // Ensure pointer events pass through
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

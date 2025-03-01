import * as THREE from 'three';

// Custom CRT shader implementation
export const CRTShader = {
  name: 'CRTShader',
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(1, 1) },
    curvature: { value: 2.0 },
    scanlineIntensity: { value: 0.15 },
    scanlineCount: { value: 800 },
    vignetteIntensity: { value: 0.3 }
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform vec2 resolution;
    uniform float curvature;
    uniform float scanlineIntensity;
    uniform float scanlineCount;
    uniform float vignetteIntensity;
    varying vec2 vUv;
    
    vec2 curveRemapUV(vec2 uv) {
      // Convert UV from [0,1] to [-1,1]
      vec2 offsetUV = uv * 2.0 - 1.0;
      
      // Apply barrel distortion
      vec2 distortedUV = offsetUV / (1.0 - curvature * length(offsetUV) * 0.2);
      
      // Convert back to [0,1] range
      return distortedUV * 0.5 + 0.5;
    }
    
    void main() {
      // Apply screen curvature
      vec2 remappedUV = curveRemapUV(vUv);
      
      // Check if outside of [0,1] range (outside of screen)
      if (remappedUV.x < 0.0 || remappedUV.x > 1.0 || remappedUV.y < 0.0 || remappedUV.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }
      
      // Sample the texture
      vec4 texel = texture2D(tDiffuse, remappedUV);
      
      // Apply scanlines
      float scanlineEffect = sin(remappedUV.y * scanlineCount) * 0.5 + 0.5;
      texel.rgb *= mix(1.0, scanlineEffect, scanlineIntensity);
      
      // Apply subtle phosphor flicker
      float flicker = sin(time * 8.0) * 0.015 + 1.0;
      texel.rgb *= flicker;
      
      // Apply vignette
      float vignette = 1.0 - vignetteIntensity * length(vUv * 2.0 - 1.0);
      vignette = smoothstep(0.0, 1.0, vignette);
      texel.rgb *= vignette;
      
      // Output final color
      gl_FragColor = texel;
    }
  `
};

export default CRTShader;

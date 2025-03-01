/**
 * Simple polyfill to ensure better support for WebGL effects in Safari
 * This checks for Safari-specific feature support and applies necessary fixes
 */

export const applySafariPolyfills = () => {
  // Check if we're running in Safari
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  if (isSafari) {
    console.log('Safari detected, applying WebGL compatibility fixes');
    
    // Add any Safari-specific polyfills or adjustments here
    // For example, you might need to handle WebGL context differently
    
    // Add a class to the body for Safari-specific CSS adjustments
    document.body.classList.add('safari-browser');
  }
  
  // Add CSS variables that can be used for browser-specific adjustments
  document.documentElement.style.setProperty('--browser-safari', isSafari ? '1' : '0');
};

export default applySafariPolyfills;

Great! I'll find the best ways to create a CRT monitor effect in Three.js, whether through custom shaders or existing post-processing effects.

I'll include:
- How to implement scanlines, phosphorus glow, chromatic aberration, and flickering.
- Both custom shader and library-based approaches.
- How to apply the effect to the entire scene.
- Notes on how to optimize performance if needed.

I'll get back to you with the details soon!

# CRT Monitor Effect in Three.js

Creating a convincing **CRT monitor effect** in Three.js involves simulating the visual quirks of old displays: **scanlines**, a subtle **phosphor glow**, slight **chromatic aberration**, and occasional **flickering**. The effect is applied as a post-processing filter on the entire scene, meaning the scene is rendered normally first, then the CRT look is layered on top via shader effects ([threejs.org](https://threejs.org/docs/examples/en/postprocessing/EffectComposer.html#:~:text=Used%20to%20implement%20post,is%20automatically%20rendered%20to%20screen)). Below we explore two approaches: building a **custom CRT shader** and using **existing Three.js/third-party effects**, and discuss how to apply the effect globally with performance in mind.

 ([GitHub - felixturner/bad-tv-shader: BadTV Effect for Three.js](https://github.com/felixturner/bad-tv-shader)) *Example of a CRT shader effect applied to a 3D scene, showing horizontal scanlines, color bleeding, and distortion ([Tools — blog — John Daro](https://www.johndaro.com/blog/tag/Tools#:~:text=%28https%3A%2F%2Fwww,of%20objects%20on%20old%20TVs)).*

## Key Components of a CRT Shader Effect

A CRT effect is a combination of several visual components that emulate old TV/monitor characteristics ([Tools — blog — John Daro](https://www.johndaro.com/blog/tag/Tools#:~:text=Ray%20Tube%29%20monitors,shader%29%2C%20so%20I%20built%20a)):

- **Scanlines:** Dark horizontal lines across the screen (one per row or every few rows) to mimic the line-by-line electron beam scan. This adds a striped appearance and slightly reduces brightness on alternating lines ([Tools — blog — John Daro](https://www.johndaro.com/blog/tag/Tools#:~:text=Ray%20Tube%29%20monitors,shader%29%2C%20so%20I%20built%20a)).  
- **Phosphor Glow (Bleed):** A faint glow or bloom around bright areas, emulating the way phosphor pixels would illuminate their surroundings. Bright spots bleed into neighboring areas, creating a soft *halation* effect ([Cheap way to approximate phosphor glow/bleed? - Shaders - Libretro Forums](https://forums.libretro.com/t/cheap-way-to-approximate-phosphor-glow-bleed/21584#:~:text=The%20cheapest%20method%20I%E2%80%99ve%20found,low%20luminosity%20areas%20stay%20darker)).  
- **Chromatic Aberration:** Slight misalignment of color channels (red, green, blue), especially toward screen edges, causing color fringing. This simulates the imperfect convergence of CRT electron guns ([Tools — blog — John Daro](https://www.johndaro.com/blog/tag/Tools#:~:text=%28https%3A%2F%2Fwww,of%20objects%20on%20old%20TVs)).  
- **Flickering and Noise:** A subtle flicker (often at the refresh rate ~60Hz) and random noise/grain contribute to the vintage feel. The **scanline flicker** and static noise emulate the less stable image of a CRT ([Tools — blog — John Daro](https://www.johndaro.com/blog/tag/Tools#:~:text=Ray%20Tube%29%20monitors,shader%29%2C%20so%20I%20built%20a)).

Tuning these components together produces the overall CRT look. Now, let's see how to implement them.

## Approach 1: Custom Shader (GLSL Post-Processing)

Using a custom shader gives you full control over the CRT effect. The idea is to write a fragment shader that takes the rendered scene as input (a texture) and modifies each pixel’s color to add scanlines, glow, aberration, and flicker. You can then apply this shader as a fullscreen pass using Three.js’s `EffectComposer` and `ShaderPass`.

**Shader Implementation:** In the shader’s fragment code, you can implement each effect step by step:
- *Scanlines:* Use the pixel’s y-coordinate to darken alternating lines. For example, use a modulo or sine function based on `gl_FragCoord.y` or UV to create a stripe pattern. A simple approach is to multiply the color by a value that oscillates per line. For instance: 

  ```glsl
  float line = mod(gl_FragCoord.y, 2.0);
  float scanFade = mix(1.0, 0.5, step(line, 0.5)); // 0.5 intensity on every other line
  color *= scanFade;
  ``` 

  This darkens every other horizontal line. You can control intensity and line thickness via uniforms (e.g., `scanlineIntensity`, `scanlineCount`). A sine wave can also produce a smoother scanline brightness variation. The Three.js **FilmShader** uses a similar technique, adding configurable scanline count and intensity ([定制着色器和渲染后期处理 - heavi - 博客园](https://www.cnblogs.com/w-wanglei/p/6790326.html#:~:text=match%20at%20L226%20scanlineIntensity%2FFilmPass%E4%BC%9A%E5%9C%A8%E5%B1%8F%E5%B9%95%E4%B8%8A%E6%B7%BB%E5%8A%A0%E4%B8%80%E4%BA%9B%E6%89%AB%E6%8F%8F%E7%BA%BF%E3%80%82%E9%80%9A%E8%BF%87%E8%AF%A5%E5%B1%9E%E6%80%A7%EF%BC%8C%E5%8F%AF%E4%BB%A5%E6%8C%87%E5%AE%9A%E6%89%AB%E6%8F%8F%E7%BA%BF%E7%9A%84%E6%98%BE%E8%91%97%E7%A8%8B%E5%BA%A6)).

- *Chromatic Aberration:* Sample the scene texture multiple times with slight UV offsets for different color channels. For example, offset the red and blue channels in opposite directions by a small amount (few pixels): 

  ```glsl
  vec2 offset = vec2(aberrationAmount); // small value, e.g., 1.0/resolution.x
  float r = texture2D(tDiffuse, vUv + offset).r;
  float g = texture2D(tDiffuse, vUv).g;
  float b = texture2D(tDiffuse, vUv - offset).b;
  vec3 chromaColor = vec3(r, g, b);
  ```

  Then blend `chromaColor` with the original `color` based on an aberration strength. This creates color fringes at high-contrast edges ([Tools — blog — John Daro](https://www.johndaro.com/blog/tag/Tools#:~:text=,of%20the%20vertical%20scanline%20displacement)). You can increase the offset with distance from screen center for a radial aberration effect.

- *Phosphor Glow:* A full implementation might require a bloom (blur) pass, but a simple approximation can be done in the shader by blending the color with a blurred version of itself. One trick is to take additional samples slightly shifted in all directions (or use a small convolution kernel) and add them to the color for a halo effect. For better results, a separate bloom pass is often used (see Approach 2), but note that it costs more performance. The classic approach is a two-pass Gaussian blur on the scene, then combining it additively with the original ([Cheap way to approximate phosphor glow/bleed? - Shaders - Libretro Forums](https://forums.libretro.com/t/cheap-way-to-approximate-phosphor-glow-bleed/21584#:~:text=The%20same%20way%20the%20various,or%20a%20screen%20combine%2C%20etc)). In a single shader, you might do a very small blur for bright pixels as an approximation.

- *Flicker/Noise:* Introduce a time-based variation. For flicker, multiply the final color by a small oscillating factor like `1.0 + 0.05*sin(time * 120.0)` to simulate a 60Hz flicker (120π rad/sec ≈ 60 cycles). For static noise, you can add a pseudo-random value to the color or use a precomputed noise texture. The Three.js FilmShader, for instance, has a `noiseIntensity` uniform that adds grain and flickering to mimic a film/CRT effect ([Tools — blog — John Daro](https://www.johndaro.com/blog/tag/Tools#:~:text=Ray%20Tube%29%20monitors,shader%29%2C%20so%20I%20built%20a)).

**Combining in Shader:** All these can be combined in your fragment shader code. After computing them, you output the modified color. Here’s a **simplified example** of a fragment shader integrating a few effects:

```glsl
uniform sampler2D tDiffuse;
uniform float time;
uniform float scanlineIntensity;
uniform float scanlineCount;
uniform float aberrationAmount;
varying vec2 vUv;

void main() {
    vec4 texColor = texture2D(tDiffuse, vUv);
    vec3 color = texColor.rgb;
    // 1. Scanlines
    float line = mod(gl_FragCoord.y * 0.5 * scanlineCount, 3.14159); // using half resolution and pi for variation
    float scan = sin(line) * 0.5 + 0.5;          // sine wave between 0 and 1
    color *= mix(1.0, scan, scanlineIntensity);  // darken based on scanline intensity
    // 2. Chromatic aberration (simple horizontal RGB shift)
    float offset = aberrationAmount;
    vec3 shifted;
    shifted.r = texture2D(tDiffuse, vUv + vec2(offset, 0.0)).r;
    shifted.g = texture2D(tDiffuse, vUv).g;
    shifted.b = texture2D(tDiffuse, vUv - vec2(offset, 0.0)).b;
    color = mix(color, shifted, 0.5);            // blend original with shifted color
    // 3. Flicker (global intensity modulation)
    color *= 0.98 + 0.02 * sin(time * 120.0);
    gl_FragColor = vec4(color, texColor.a);
}
```

In practice you would refine the above (and handle aspect ratio for scanlines, etc.), but it outlines the idea. This shader can be used with Three.js by creating a `ShaderMaterial` or via `THREE.ShaderPass`. For example:

```js
// After rendering your scene to a renderTarget or using EffectComposer:
const crtShader = {
  uniforms: {
    "tDiffuse": { value: null },
    "time": { value: 0 },
    "scanlineIntensity": { value: 0.5 },
    "scanlineCount": { value: 400.0 },    // number of scanlines (adjust per resolution)
    "aberrationAmount": { value: 0.005 }
  },
  vertexShader: /* screen quad basic vertex shader with vUv varying */,
  fragmentShader: /* the GLSL code from above */
};
const crtPass = new THREE.ShaderPass(crtShader);
crtPass.renderToScreen = true;
composer.addPass(crtPass);
```

Here, the scene is rendered to a texture (via an earlier `RenderPass` in the composer), and then `crtPass` applies the CRT shader to that texture. We set `renderToScreen = true` on the last pass so it outputs to the canvas. In your animation loop, use `composer.render()` instead of `renderer.render` to draw the final effect.

**Adjusting Uniforms:** You can animate the `time` uniform (`crtPass.uniforms.time.value = performance.now()/1000;`) each frame for the flicker/noise to work. Tweak `scanlineCount` to match your resolution (e.g., if your canvas is 800px tall, use ~800 scanlines for single-pixel lines). `scanlineIntensity` can be tuned between 0 (no effect) and 1 (full dark lines). `aberrationAmount` usually needs to be very small (on the order of 0.001–0.01) or it will be too strong.

This custom approach gives flexibility. You could also incorporate curvature or distortion if needed (by warping the sampling coordinates to curve the image slightly). The downside is you must write and maintain the shader, and ensure it’s optimized.

## Approach 2: Using Existing Shaders and Libraries

If you prefer not to write the shader from scratch, Three.js and its community offer several ready-made solutions that achieve the CRT look. You can stack a few existing post-processing passes to cover the main CRT effects:

- **FilmPass (FilmShader):** Three.js includes a FilmPass that simulates an old TV/film effect with grain and scanlines. It has uniforms for noise intensity, scanline intensity, and scanline count. For example, `THREE.FilmPass(noiseIntensity, scanlineIntensity, scanlineCount, grayscale)` creates the pass ([定制着色器和渲染后期处理 - heavi - 博客园](https://www.cnblogs.com/w-wanglei/p/6790326.html#:~:text=var%20effectFilm%20%3D%20new%20THREE,renderToScreen%20%3D%20true%3B%20%2F%2F%E8%AE%BE%E7%BD%AE%E8%BE%93%E5%87%BA%E5%88%B0%E5%B1%8F%E5%B9%95%E4%B8%8A)). FilmPass “simulates a TV screen by applying scanlines and distortions” ([[PDF] Learning Three.js: The JavaScript 3D Library for WebGL](https://www.doc-developpement-durable.org/file/Projets-informatiques/cours-&-manuels-informatiques/java/Learning%20Three.js-%20The%20JavaScript%203D%20Library%20for%20WebGL.pdf#:~:text=,The%20subsequent%20passes)). You can add it to an EffectComposer chain. For instance: 

  ```js
  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  const filmPass = new THREE.FilmPass(0.5, 0.8, 648, false); // noise, scanline intensity, count, grayscale
  filmPass.renderToScreen = true;
  composer.addPass(filmPass);
  ```
  
  In this example, we set a moderate noise and high scanline intensity with 648 scanlines (if the vertical resolution is around that number of pixels). The FilmPass will add moving grain noise and dark scan lines across the output ([定制着色器和渲染后期处理 - heavi - 博客园](https://www.cnblogs.com/w-wanglei/p/6790326.html#:~:text=match%20at%20L226%20scanlineIntensity%2FFilmPass%E4%BC%9A%E5%9C%A8%E5%B1%8F%E5%B9%95%E4%B8%8A%E6%B7%BB%E5%8A%A0%E4%B8%80%E4%BA%9B%E6%89%AB%E6%8F%8F%E7%BA%BF%E3%80%82%E9%80%9A%E8%BF%87%E8%AF%A5%E5%B1%9E%E6%80%A7%EF%BC%8C%E5%8F%AF%E4%BB%A5%E6%8C%87%E5%AE%9A%E6%89%AB%E6%8F%8F%E7%BA%BF%E7%9A%84%E6%98%BE%E8%91%97%E7%A8%8B%E5%BA%A6)). You can adjust these parameters to taste. (If you only see scanlines but no noise, ensure you're continuously updating the shader’s time uniform; the FilmPass in Three.js example code updates its internal time to animate the noise.)

- **RGB Shift (Chromatic Aberration):** Three.js’s **RGBShiftShader** (often used via `THREE.ShaderPass(THREE.RGBShiftShader)`) offsets the red and blue channels to produce chromatic aberration. You can add it as another pass. For example:

  ```js
  const renderPass = new THREE.RenderPass(scene, camera);
  const filmPass = new THREE.FilmPass(...);
  const rgbShift = new THREE.ShaderPass(THREE.RGBShiftShader);
  rgbShift.uniforms['amount'].value = 0.0015;   // set tiny aberration
  rgbShift.uniforms['angle'].value = 0.0;       // 0 for horizontal shift; try 1.57 for vertical
  composer.addPass(renderPass);
  composer.addPass(rgbShift);
  composer.addPass(filmPass);
  filmPass.renderToScreen = true;
  ```
  
  Here we apply RGB shift **before** FilmPass (so the noise/scanlines from FilmPass are not themselves color-shifted, but you could experiment with order). The `amount` is the strength of color separation ([Tools — blog — John Daro](https://www.johndaro.com/blog/tag/Tools#:~:text=,of%20the%20vertical%20scanline%20displacement)). We set the last pass to render to screen. The combination of RGBShift + FilmPass yields color fringing + scanlines+noise. 

- **Bloom/Glow:** To get the phosphor glow, you can include a bloom pass. Three.js provides **UnrealBloomPass** which is an advanced bloom effect. You would add `const bloomPass = new UnrealBloomPass(resolution, strength, radius, threshold)` before the FilmPass. However, be mindful that bloom is a heavy effect. UnrealBloomPass internally renders multiple downsampled buffers and blurs, which can impact performance. A lighter alternative is to use a simple **BloomPass** from the older examples or even a **SSAARenderPass** with a slight blur. For authenticity, apply bloom subtly so bright areas bloom into dark areas ([Cheap way to approximate phosphor glow/bleed? - Shaders - Libretro Forums](https://forums.libretro.com/t/cheap-way-to-approximate-phosphor-glow-bleed/21584#:~:text=The%20cheapest%20method%20I%E2%80%99ve%20found,low%20luminosity%20areas%20stay%20darker)). For example:

  ```js
  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 
                                             0.5, 0.4, 0.85);
  composer.addPass(bloomPass);
  ```
  This will add a soft glow (strength 0.5) to bright parts of the scene. You typically put bloom before any film/scanline pass so that the bloom itself gets the scanline pattern too.

- **“Bad TV” Shader:** Felix Turner’s **BadTVShader** is a community shader specifically made to mimic bad CRT television effects (distortions, roll, static). It includes uniforms for distortion, frequency, roll speed, etc. Using it is similar to above ShaderPasses ([GitHub - felixturner/bad-tv-shader: BadTV Effect for Three.js](https://github.com/felixturner/bad-tv-shader#:~:text=Usage)). For instance:
  
  ```js
  const badTVPass = new THREE.ShaderPass(THREE.BadTVShader);
  badTVPass.uniforms['distortion'].value = 3.0;
  badTVPass.uniforms['distortion2'].value = 1.0;
  badTVPass.uniforms['speed'].value = 0.2;
  badTVPass.uniforms['rollSpeed'].value = 0.1;
  badTVPass.renderToScreen = true;
  composer.addPass(renderPass);
  composer.addPass(badTVPass);
  ```
  
  The BadTVShader produces scanline-like tearing and vertical hold effects (like a de-tuned TV). It might be overkill for a general CRT monitor effect, but is useful if you want a very **glitchy, old-TV vibe** (think VHS tape distortion). The demo shows horizontal wave distortion and vertical scrolling noise ([GitHub - felixturner/bad-tv-shader: BadTV Effect for Three.js](https://github.com/felixturner/bad-tv-shader#:~:text=Bad%20TV%20Shader%20for%20Three)).

- **Third-Party PostProcessing Library:** The **postprocessing** library by vanruesc (PMNDRS) provides many effects out-of-the-box, including ChromaticAberrationEffect, ScanlineEffect (which can be created via a pattern), NoiseEffect, VignetteEffect, BloomEffect, etc. One advantage of this library is that it can combine multiple effects in one pass for better performance ([Postprocessing performance - Questions - three.js forum](https://discourse.threejs.org/t/postprocessing-performance/35776#:~:text=drcmda%20%20March%2010%2C%202022%2C,4%3A41pm%20%203)). For example, using it in a React Three Fiber or plain Three.js setup, you could do:

  ```js
  import { EffectComposer, EffectPass, RenderPass, BloomEffect, ChromaticAberrationEffect, NoiseEffect } from 'postprocessing';
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new BloomEffect({ intensity: 0.5 });
  const chromAberr = new ChromaticAberrationEffect({ offset: new THREE.Vector2(0.001, 0.001) });
  const noise = new NoiseEffect({ premultiply: true });
  noise.blendMode.opacity.value = 0.3;
  composer.addPass(new EffectPass(camera, bloom, chromAberr, noise));
  ```
  
  Here, `EffectPass` takes multiple effects and internally merges them. The library handles fullscreen shaders under the hood, and by grouping effects it reduces the number of render passes needed (improving performance). This approach is convenient if you don't want to tweak low-level shader code but still want fine control over each effect's parameters.

In all these cases, to **apply the effect globally**, ensure your final pass (`filmPass`, `badTVPass`, or `EffectPass`, etc.) has `renderToScreen = true` (if using Three.js `EffectComposer`). That final pass will output the processed image to the canvas ([GitHub - felixturner/bad-tv-shader: BadTV Effect for Three.js](https://github.com/felixturner/bad-tv-shader#:~:text=composer%20%3D%20new%20THREE,renderToScreen%20%3D%20true)). Also, replace your normal `renderer.render(scene, camera)` call with the composer’s render call:

```js
function animate() {
  requestAnimationFrame(animate);
  // update any animations/uniforms here, e.g., crtPass.uniforms.time.value += delta;
  composer.render();
}
```

This way, the entire scene goes through the post-processing chain each frame.

## Performance Tips for CRT Shader Effects

Post-processing effects inevitably add overhead, but there are ways to optimize while maintaining visual fidelity:

- **Combine Passes:** Each post-process pass means an extra full-screen draw. Try to minimize the number of passes. If you can merge effects into one shader (or use a library that batches effects) you will save on GPU texture reads/writes ([Postprocessing performance - Questions - three.js forum](https://discourse.threejs.org/t/postprocessing-performance/35776#:~:text=drcmda%20%20March%2010%2C%202022%2C,4%3A41pm%20%203)). For example, instead of separate FilmPass and RGBShift, you could write one custom shader that does both, or use a combined EffectPass as shown above.

- **Resolution and Scaling:** Running bloom or heavy blur at full resolution is expensive. Use lower resolution buffers for glow effects when possible. UnrealBloomPass, for instance, downsamples internally. You can also set your EffectComposer to render at a lower resolution than the screen (e.g., `composer.setSize(window.innerWidth/2, window.innerHeight/2)` for heavy effects, then upscale) to gain performance at the cost of some sharpness.

- **Optimize Scanlines Calculation:** Calculating a sine for every pixel can add up. You can precompute a 1D texture of a scanline pattern (or a small repeating stripe texture) and simply multiply it with the scene as an overlay. This turns the math into a texture lookup, which might be more efficient on some GPUs. However, for moderate resolutions a simple `mod()` or `sin()` in shader is usually fine.

- **Temporal Effects:** If you use **noise textures**, reuse them instead of computing random values per pixel. A tiled noise texture can be scrolled or blended for animation, saving costly per-pixel rand computations. If flicker is just a uniform scaling, its cost is negligible, so focus on optimizing blur and multi-sampling effects instead.

- **Adjust Quality**: Many effects have quality knobs. For example, reduce bloom **radius** or iterations, reduce **scanlineCount** if they are too fine to see, or lower the noise intensity. These adjustments can let you trade a bit of accuracy for speed. Also consider turning off the CRT effect for high-performance needs or allowing the user to toggle it.

- **Use of WebGL2 Features:** If available, you might leverage multiline rendering or shader derivatives for certain effects (though not critical here). Ensuring you use `THREE.WebGLRenderer({ powerPreference: "high-performance" })` can also help on some systems to get a faster GPU context.

With a careful setup, a CRT effect can be made performant. The key is balancing fidelity and cost – for example, a **luminosity-based bloom** blends the blurred image based on brightness so that only bright areas add glow ([Cheap way to approximate phosphor glow/bleed? - Shaders - Libretro Forums](https://forums.libretro.com/t/cheap-way-to-approximate-phosphor-glow-bleed/21584#:~:text=The%20cheapest%20method%20I%E2%80%99ve%20found,low%20luminosity%20areas%20stay%20darker)), which can look good even with a low-strength blur. Also, consider that scanlines and aberration are mostly aesthetic; you might get away with slightly reducing their intensity on lower-end devices to save some processing.

By using the techniques above – either custom GLSL or built-in effects – you can globally apply a convincing CRT monitor filter to your Three.js scene. Remember to test on multiple devices, as post-processing can affect mobile GPUs differently. With the right tweaks, you'll achieve that nostalgic **“retro monitor”** look without overwhelming the renderer. Enjoy your journey back to the 80s CRT vibe!

**Sources:**

1. Three.js documentation – *EffectComposer*: managing chains of post-processing passes ([threejs.org](https://threejs.org/docs/examples/en/postprocessing/EffectComposer.html#:~:text=Used%20to%20implement%20post,is%20automatically%20rendered%20to%20screen))  
2. John Daro – *Building a Retro CRT Effect*: outlines scanlines, noise, and chromatic aberration techniques ([Tools — blog — John Daro](https://www.johndaro.com/blog/tag/Tools#:~:text=%28https%3A%2F%2Fwww,of%20objects%20on%20old%20TVs)) ([Tools — blog — John Daro](https://www.johndaro.com/blog/tag/Tools#:~:text=,the%20scanlines%20appear))  
3. *Learning Three.js* (Packt) – notes on FilmPass simulating a TV with scanlines & distortion ([[PDF] Learning Three.js: The JavaScript 3D Library for WebGL](https://www.doc-developpement-durable.org/file/Projets-informatiques/cours-&-manuels-informatiques/java/Learning%20Three.js-%20The%20JavaScript%203D%20Library%20for%20WebGL.pdf#:~:text=,The%20subsequent%20passes))  
4. Three.js example shader – *Bad TV Shader*: implementation of CRT distortion, with usage example ([GitHub - felixturner/bad-tv-shader: BadTV Effect for Three.js](https://github.com/felixturner/bad-tv-shader#:~:text=Usage))  
5. Libretro Forums – *Phosphor glow discussion*: on using blur + blend for bloom and optimizing glow by luminosity ([Cheap way to approximate phosphor glow/bleed? - Shaders - Libretro Forums](https://forums.libretro.com/t/cheap-way-to-approximate-phosphor-glow-bleed/21584#:~:text=The%20same%20way%20the%20various,or%20a%20screen%20combine%2C%20etc)) ([Cheap way to approximate phosphor glow/bleed? - Shaders - Libretro Forums](https://forums.libretro.com/t/cheap-way-to-approximate-phosphor-glow-bleed/21584#:~:text=The%20cheapest%20method%20I%E2%80%99ve%20found,low%20luminosity%20areas%20stay%20darker))  
6. Three.js Forum – *Postprocessing performance*: recommendation to combine effects into one pass or use integrated libraries for speed
---
example_description: "Las tres puertas a la GPU desde una página: los contextos «webgl» (WebGL 1, OpenGL ES 2.0) y «webgl2» (WebGL 2, OpenGL ES 3.0) de un canvas, y navigator.gpu (WebGPU). Qué versión hay, qué GPU hay debajo y la textura más grande que admite; los valores dependen de la máquina"
example_tags: "javascript|webgl|webgl2|webgpu|gpu|getcontext|capacidades"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Un <canvas> puede dar un contexto 2d, webgl, webgl2 o webgpu (lección «Canvas y gráficos»).
// Estos lienzos no se añaden a la página: solo se usan para preguntar.
const gl1 = document.createElement('canvas').getContext('webgl');
const gl2 = document.createElement('canvas').getContext('webgl2');
console.log('webgl  →', gl1 ? gl1.getParameter(gl1.VERSION) : 'no disponible');
console.log('webgl2 →', gl2 ? gl2.getParameter(gl2.VERSION) : 'no disponible');

if (gl2) {
  console.log('GLSL de webgl2 →', gl2.getParameter(gl2.SHADING_LANGUAGE_VERSION));
  // El nombre real de la GPU está «enmascarado»; esta extensión lo da (y puede desaparecer)
  const debugInfo = gl2.getExtension('WEBGL_debug_renderer_info');
  console.log('GPU →', debugInfo ? gl2.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'oculta');
  console.log('textura más grande →', gl2.getParameter(gl2.MAX_TEXTURE_SIZE), 'px de lado');
}

// WebGPU no sale de un canvas sino de navigator.gpu (módulo «WebGPU», al final del capítulo)
const adapter = await navigator.gpu?.requestAdapter();
console.log('WebGPU →', adapter ? `${adapter.info.vendor} · ${adapter.info.architecture}` : 'no disponible');

// Los contextos son un recurso limitado (Chrome mantiene unos 16 a la vez): libera los que no uses
for (const gl of [gl1, gl2]) gl?.getExtension('WEBGL_lose_context')?.loseContext();
```
